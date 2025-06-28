const { PrismaClient } = require("@prisma/client");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendOrderCreatedEmail } = require("../config/email");

const prisma = new PrismaClient();

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

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

    const subtotal = cart.items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
    const taxes = subtotal * 0.21;
    const total = subtotal + taxes;

    console.log("Subtotal:", subtotal);
    console.log("Impuestos (21%):", taxes);
    console.log("Total con impuestos:", total);

    // Crear items para MercadoPago incluyendo los impuestos
    const items = [
      // Items de productos
      ...cart.items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: parseFloat(item.product.price),
        currency_id: "ARS",
      })),
      // Item de impuestos
      {
        id: "taxes",
        title: "Impuestos (21%)",
        quantity: 1,
        unit_price: taxes,
        currency_id: "ARS",
      }
    ];

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total: total.toFixed(2),
        status: 0,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.product.price),
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
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 1 }, // Procesando
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log("Carrito vaciado y orden completada");

    const orderWithUser = await prisma.order.findUnique({
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

    try {
      await sendOrderCreatedEmail(orderWithUser.user.email, orderWithUser);
      console.log(`Email de orden creada enviado a ${orderWithUser.user.email}`);
    } catch (emailError) {
      console.error("Error enviando email de orden creada:", emailError);
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
      console.log("Procesando pago con ID:", data.id);

      const paymentData = await new Payment(client).get({ paymentId: data.id });
      console.log("Datos del pago:", JSON.stringify(paymentData, null, 2));

      const orderId = paymentData.external_reference;
      console.log("ID de orden encontrado:", orderId);

      if (paymentData.status === "approved") {
        console.log("Pago aprobado, actualizando orden a COMPLETED");

        const order = await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: 4 },
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        console.log("Orden encontrada:", order ? `ID ${order.id}` : "No encontrada");
        console.log("Usuario:", order?.user?.email || "Sin email");

        try {
          await sendOrderConfirmationEmail(order.user.email, order);
          console.log(`Email de confirmacion enviado a ${order.user.email}`);
        } catch (emailError) {
          console.error("Error enviando email de confirmacion:", emailError);
        }
      } else if (paymentData.status === "pending") {
        console.log("Pago pendiente, actualizando orden a PROCESSING");
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: 1 },
        });
      } else if (paymentData.status === "rejected") {
        console.log("Pago rechazado, actualizando orden a CANCELLED");
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: 3 },
        });
      } else {
        console.log("Estado desconocido, manteniendo orden como PENDING");
      }
    }

    res.status(200).json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    res.status(500).json({ error: "Error procesando webhook" });
  }
};

const testWebhook = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    console.log("=== PRUEBA DE WEBHOOK ===");
    console.log("Orden ID:", orderId);
    console.log("Estado:", status);

    const order = await prisma.order.findUnique({
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

    console.log("Orden encontrada:", order.id);
    console.log("Usuario:", order.user.email);

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: parseInt(status) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    try {
      await sendOrderStatusUpdateEmail(order.user.email, updatedOrder, updatedOrder.status);
      console.log(`Email de confirmacion enviado a ${order.user.email}`);
    } catch (emailError) {
      console.error("Error enviando email de actualizacion:", emailError);
    }

    res.json({
      message: "Estado de orden actualizado correctamente",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error en prueba de webhook:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { user } = req;

    let orders;
    if (user.role === "ADMIN" || user.role === "SALES_MANAGER") {
      orders = await prisma.order.findMany({
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error obteniendo ordenes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const { user } = req;

    console.log("Actualizando estado de orden:", { orderId, status });

    if (user.role !== "ADMIN" && user.role !== "SALES_MANAGER") {
      return res.status(403).json({ error: "No tienes permisos para actualizar ordenes" });
    }

    const existingOrder = await prisma.order.findUnique({
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

    const validStatuses = [0, 1, 2, 3];
    if (!validStatuses.includes(parseInt(status))) {
      return res.status(400).json({ error: "Estado invalido" });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: parseInt(status) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("Orden actualizada exitosamente:", order.id);

    try {
      await sendOrderStatusUpdateEmail(order.user.email, order, order.status);
      console.log(`Email de actualizacion de estado enviado a ${existingOrder.user.email}`);
    } catch (emailError) {
      console.error("Error enviando email de actualizacion:", emailError);
    }

    res.json({
      message: "Estado de orden actualizado correctamente",
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
    const { user } = req;

    console.log("Intentando cancelar orden:", { orderId, userId: user.id, userRole: user.role });

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
      },
    });

    console.log("Orden encontrada:", order);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const isOwner = order.userId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SALES_MANAGER";

    console.log("Permisos:", { isOwner, isAdmin, orderUserId: order.userId, currentUserId: user.id });

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "No tienes permisos para cancelar esta orden" });
    }

    const CANCELABLE_STATUSES = [0, 1];

    console.log("Estado actual de la orden:", order.status);
    console.log("Estados cancelables:", CANCELABLE_STATUSES);

    if (!CANCELABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({ 
        error: "No se puede cancelar una orden que ya fue procesada o cancelada" 
      });
    }

    console.log("Actualizando orden a estado CANCELLED (3)");

    const cancelledOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 3 },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("Orden cancelada exitosamente:", cancelledOrder.id);

    try {
      await sendOrderStatusUpdateEmail(cancelledOrder.user.email, cancelledOrder, cancelledOrder.status);
    } catch (emailError) {
      console.error("Error enviando email de cancelacion:", emailError);
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
