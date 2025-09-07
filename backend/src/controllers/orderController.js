const { PrismaClient } = require("@prisma/client");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendOrderCreatedEmail } = require("../config/email");
const { publishToQueue } = require("../utils/queue");
const axios = require('axios');

const prisma = new PrismaClient();

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

// Función para obtener tasas de cambio
const getExchangeRates = async () => {
  // Usar directamente las tasas simuladas para evitar bucles
  // Estas tasas coinciden con las del controlador de moneda
  return {
    EUR: 1.0000,
    USD: 1.0870,
    GBP: 0.8558,
    JPY: 163.0435,
    AUD: 1.6522,
    CAD: 1.4674,
    CHF: 0.9565,
    CNY: 7.8261,
    ARS: 1358.7086,
    CLP: 1100.0157,
    COP: 4736.9395,
    MXN: 22.1275,
    PEN: 4.1276,
    UYU: 46.8593
  };
};

// Función para convertir moneda
const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  
  if (!fromRate || !toRate) return amount;
  
  // Convertir: fromCurrency -> EUR -> toCurrency
  const amountInEUR = amount / fromRate;
  return amountInEUR * toRate;
};

const createOrder = async (req, res) => {
  try {
    console.log("Creando nuevo pedido para el usuario:", req.user.id);

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      console.log("Carrito vacio o no encontrado");
      return res.status(400).json({ error: "El carrito esta vacio" });
    }

    console.log("Items carrito:", cart.items);

    // Obtener tasas de cambio
    const exchangeRates = await getExchangeRates();
    console.log("Tasas de cambio obtenidas:", exchangeRates);

    // Calcular subtotal en USD (precios originales)
    const subtotalUSD = cart.items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
    const taxesUSD = subtotalUSD * 0.21;
    const totalUSD = subtotalUSD + taxesUSD;

    console.log("Subtotal (USD):", subtotalUSD);
    console.log("Impuestos (USD):", taxesUSD);
    console.log("Total (USD):", totalUSD);

    // Convertir a pesos argentinos
    const subtotalARS = convertCurrency(subtotalUSD, 'USD', 'ARS', exchangeRates);
    const taxesARS = convertCurrency(taxesUSD, 'USD', 'ARS', exchangeRates);
    const totalARS = convertCurrency(totalUSD, 'USD', 'ARS', exchangeRates);

    console.log("Subtotal (ARS):", subtotalARS);
    console.log("Impuestos (ARS):", taxesARS);
    console.log("Total (ARS):", totalARS);

    // Crear items para MercadoPago con precios convertidos a ARS
    const items = [
      // Items de productos
      ...cart.items.map((item) => {
        const priceUSD = parseFloat(item.product.price);
        const priceARS = convertCurrency(priceUSD, 'USD', 'ARS', exchangeRates);
        
        return {
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          unit_price: priceARS,
          currency_id: "ARS",
        };
      }),
      // Item de impuestos
      {
        id: "taxes",
        title: "Impuestos (21%)",
        quantity: 1,
        unit_price: taxesARS,
        currency_id: "ARS",
      }
    ];

    const order = await prisma.orders.create({
      data: {
        userId: req.user.id,
        total: totalARS.toFixed(2), // Guardar el total en ARS
        status: 0,
        items: {
          create: req.body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(
              cart.items.find((ci) => ci.productId === item.productId).product.price
            ),
            fechaIda: item.fechaIda || null,
            fechaVuelta: item.fechaVuelta || null,
            horaIda: item.horaIda || null,
            horaVuelta: item.horaVuelta || null,
          })),
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("Orden creada:", order);

    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const successUrl = `${frontendUrl}/my-orders?success=true`;
    const failureUrl = `${frontendUrl}/my-orders?failure=true`;
    const pendingUrl = `${frontendUrl}/my-orders?pending=true`;

    console.log("Creando pago con MP de los items:", items);
    console.log("Objeto enviado a Mercado Pago:", {
      items,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      notification_url: `${process.env.BACKEND_URL}/api/orders/webhook`,
      external_reference: order.id.toString(),
    });

    const preference = {
      items,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      notification_url: `${process.env.BACKEND_URL}/api/orders/webhook`,
      external_reference: order.id.toString(),
    };

    const preferenceData = await new Preference(client).create({ body: preference });

    console.log("Preferencia de MP creada:", preferenceData);

    // Cambiar estado a "Procesando" cuando se crea la preferencia de pago
    await prisma.orders.update({
      where: { id: order.id },
      data: { status: 1 }, // Procesando
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log("Carrito vaciado y orden completada");

    const orderWithUser = await prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Encolar email asíncrono
    try {
      await publishToQueue('email_exchange', 'email', {
        type: 'orderCreated',
        data: { email: orderWithUser.user.email, order: orderWithUser }
      });
      console.log(`Email de orden creada encolado para ${orderWithUser.user.email}`);
    } catch (emailError) {
      console.error("Error encolando email de orden creada:", emailError);
    }

    res.json({
      message: "Orden creada exitosamente",
      order: {
        id: order.id,
        total: order.total,
        status: 1,
      },
      paymentUrl: preferenceData.init_point,
    });
  } catch (error) {
    console.error("Error creando orden:", error);
    
    // Si es un error de MercadoPago, devolver información más específica
    if (error.message && error.error) {
      return res.status(400).json({ 
        error: "Error en la configuración del pago", 
        details: error.message 
      });
    }
    
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const handleWebhook = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECIBIDO ===");
    console.log("Body completo:", JSON.stringify(req.body, null, 2));

    const { data, type } = req.body;

    if (type === "payment") {
      console.log("Encolando webhook para procesamiento asíncrono");
      
      // Encolar webhook para procesamiento asíncrono
      try {
        await publishToQueue('webhook_exchange', 'webhook', {
          data,
          type
        });
        console.log("Webhook encolado exitosamente");
      } catch (queueError) {
        console.error("Error encolando webhook:", queueError);
        // Fallback: procesar síncronamente si falla la cola
        await processWebhookSync(data, type);
      }
    }

    res.status(200).json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    res.status(500).json({ error: "Error procesando webhook" });
  }
};

// Función de fallback para procesar webhook síncronamente
const processWebhookSync = async (data, type) => {
  try {
    console.log("Procesando webhook síncronamente (fallback)");
    
    const paymentData = await new Payment(client).get({ paymentId: data.id });
    const orderId = paymentData.external_reference;

    if (paymentData.status === "approved") {
      const order = await prisma.orders.update({
        where: { id: parseInt(orderId) },
        data: { status: 2 }, // COMPLETED
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Enviar email síncrono como fallback
      try {
        await sendOrderConfirmationEmail(order.user.email, order);
        console.log(`Email de confirmación enviado a ${order.user.email}`);
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
      }

      // Actualizar stock
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }
  } catch (error) {
    console.error("Error en procesamiento síncrono:", error);
  }
};

const testWebhook = async (req, res) => {
  try {
    console.log("=== TEST WEBHOOK ===");
    
    // Simular un pago aprobado para testing
    const testOrderId = req.params.orderId;
    
    if (!testOrderId) {
      return res.status(400).json({ error: "ID de orden requerido" });
    }

    console.log("Simulando pago aprobado para orden:", testOrderId);

    const order = await prisma.orders.findUnique({
      where: { id: parseInt(testOrderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Actualizar orden a COMPLETED
    const updatedOrder = await prisma.orders.update({
      where: { id: parseInt(testOrderId) },
      data: { status: 2 }, // COMPLETED
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("Orden actualizada en test:", updatedOrder);

    // Encolar email de confirmación
    try {
      await publishToQueue('email_exchange', 'email', {
        type: 'orderConfirmed',
        data: { email: updatedOrder.user.email, order: updatedOrder }
      });
      console.log(`Email de confirmación encolado para ${updatedOrder.user.email}`);
    } catch (emailError) {
      console.error("Error encolando email de confirmación:", emailError);
    }

    res.json({ 
      message: "Test webhook ejecutado correctamente", 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Error en test webhook:", error);
    res.status(500).json({ error: "Error en test webhook" });
  }
};

const getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "ADMIN") {
      // Administradores ven todas las órdenes
      orders = await prisma.orders.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          orderStatus: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Clientes ven solo sus órdenes
      orders = await prisma.orders.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          orderStatus: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || status === undefined) {
      return res.status(400).json({ error: "ID de orden y estado son requeridos" });
    }

    // Validar que el estado sea válido (0-3)
    if (status < 0 || status > 3) {
      return res.status(400).json({ error: "Estado inválido. Debe ser 0-3" });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const order = await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { status: parseInt(status) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
      },
    });

    // Encolar email de actualización de estado
    try {
      await publishToQueue('email_exchange', 'email', {
        type: 'orderStatusUpdate',
        data: { email: order.user.email, order, status: parseInt(status) }
      });
      console.log(`Email de actualización de estado encolado para ${order.user.email}`);
    } catch (emailError) {
      console.error("Error encolando email de actualización:", emailError);
    }

    res.json({
      message: "Estado de orden actualizado exitosamente",
      order,
    });
  } catch (error) {
    console.error("Error actualizando estado de orden:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "ID de orden es requerido" });
    }

    const order = await prisma.orders.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Verificar que el usuario solo pueda cancelar sus propias órdenes (a menos que sea admin)
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para cancelar esta orden" });
    }

    // Verificar que la orden no esté ya completada o cancelada
    if (order.status === 2 || order.status === 3) {
      return res.status(400).json({ error: "No se puede cancelar una orden completada o ya cancelada" });
    }

    const cancelledOrder = await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { status: 3 }, // CANCELLED
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
      },
    });

    // Encolar email de cancelación
    try {
      await publishToQueue('email_exchange', 'email', {
        type: 'orderStatusUpdate',
        data: { email: cancelledOrder.user.email, order: cancelledOrder, status: 3 }
      });
      console.log(`Email de cancelación encolado para ${cancelledOrder.user.email}`);
    } catch (emailError) {
      console.error("Error encolando email de cancelación:", emailError);
    }

    res.json({
      message: "Orden cancelada exitosamente",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("Error cancelando orden:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  createOrder,
  handleWebhook,
  testWebhook,
  getOrders,
  updateOrderStatus,
  cancelOrder,
};