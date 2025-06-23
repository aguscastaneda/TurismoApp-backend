const { PrismaClient } = require("@prisma/client");
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { sendPurchaseEmail, sendOrderCreatedEmail, sendOrderStatusUpdateEmail } = require('../config/email');

// Inicializar Prisma
const prisma = new PrismaClient();

// Manejar errores de Prisma
prisma.$on("error", (e) => {
  console.error("Prisma Error:", e);
});

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preference = new Preference(mp);
const payment = new Payment(mp);

// Constantes para estados de orden
const ORDER_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  CANCELLED: 3
};

// Estados que permiten cancelacion
const CANCELABLE_STATUSES = [
  ORDER_STATUS.PENDING,    // 0
  ORDER_STATUS.PROCESSING  // 1
];

// Crear un nuevo pedido
const createOrder = async (req, res) => {
  try {
    console.log("Creando nuevo pedido para el usuario:", req.user.id);

    // Obtener el carrito del usuario
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

    // Calcular el total
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Calcular impuestos (21%)
    const taxes = subtotal * 0.21;
    
    // Total con impuestos
    const total = subtotal + taxes;

    console.log("Subtotal:", subtotal);
    console.log("Impuestos (21%):", taxes);
    console.log("Total con impuestos:", total);

    // Crear el pedido
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        status: 0, // Estado: PENDING
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price * 1.21, // Precio con impuestos incluidos
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
      },
    });

    console.log("Orden creada:", order);

    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    // Crear pago en MercadoPago con preferencia
    const items = cart.items.map((item) => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.price) * 1.21, // Precio con impuestos incluidos
      currency_id: "ARS",
    }));

    console.log("Creando pago con MP de los items:", items);

    console.log("Objeto enviado a Mercado Pago:", {
      items,
      back_urls: {
        success: "https://www.google.com",
        failure: "https://www.google.com",
        pending: "https://www.google.com",
      },
      auto_return: "approved",
      notification_url: `${process.env.BACKEND_URL}/api/orders/webhook`,
      external_reference: order.id.toString(),
    });

    const preferenceData = await preference.create({
      body: {
        items,
        back_urls: {
          success: "https://www.google.com",
          failure: "https://www.google.com",
          pending: "https://www.google.com",
        },
        auto_return: "approved",
        notification_url: `${process.env.BACKEND_URL}/api/orders/webhook`,
        external_reference: order.id.toString(),
      }
    });

    console.log("Preferencia de MP creada:", preferenceData);

    // Actualizar el pedido con el ID de preferencia
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: preferenceData.id },
    });

    // Vaciar carrito
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log("Carrito vaciado y orden completada");

    // Enviar email de confirmacion de orden creada
    try {
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

      if (orderWithUser && orderWithUser.user.email) {
        await sendOrderCreatedEmail(orderWithUser.user.email, {
          id: orderWithUser.id,
          total: orderWithUser.total,
          date: orderWithUser.createdAt,
          items: orderWithUser.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          }))
        });
        console.log(`Email de orden creada enviado a ${orderWithUser.user.email}`);
      }
    } catch (emailError) {
      console.error("Error al enviar email de orden creada:", emailError);
    }

    res.status(201).json({
      order,
      paymentUrl: preferenceData.init_point,
    });
  } catch (error) {
    console.error("Error al crear la orden:", error, error?.response?.data);
    res.status(500).json({ error: "Error al crear la orden: " + error.message, details: error?.response?.data });
  }
};

// Manejar webhook de MP
const handleWebhook = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECIBIDO ===");
    console.log("Body completo:", JSON.stringify(req.body, null, 2));
    
    const { type, data } = req.body;

    if (type === "payment") {
      console.log("Procesando pago con ID:", data.id);
      
      const paymentData = await payment.findById({ id: data.id });
      console.log("Datos del pago:", JSON.stringify(paymentData, null, 2));
      
      const orderId = paymentData.external_reference;
      console.log("ID de orden encontrado:", orderId);

      let status;
      switch (paymentData.status) {
        case "approved":
          status = 2; // COMPLETED
          console.log("Pago aprobado, actualizando orden a COMPLETED");
          
          // Obtener la orden con informacion del usuario para enviar email
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

          console.log("Orden encontrada:", order ? `ID ${order.id}` : "No encontrada");
          console.log("Usuario:", order?.user?.email || "Sin email");

          // Enviar email de confirmacion si la orden existe
          if (order && order.user.email) {
            try {
              await sendPurchaseEmail(order.user.email, {
                id: order.id,
                total: order.total,
                date: order.createdAt,
                items: order.items.map(item => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.price
                }))
              });
              console.log(`Email de confirmacion enviado a ${order.user.email}`);
            } catch (emailError) {
              console.error("Error al enviar email de confirmacion:", emailError);
            }
          }
          
          break;
        case "pending":
          status = 1; // PROCESSING
          console.log("Pago pendiente, actualizando orden a PROCESSING");
          break;
        case "rejected":
          status = 3; // CANCELLED
          console.log("Pago rechazado, actualizando orden a CANCELLED");
          break;
        default:
          status = 0; // PENDING
          console.log("Estado desconocido, manteniendo orden como PENDING");
      }

      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status },
      });
      
      console.log(`Orden ${orderId} actualizada a estado ${status}`);
    } else {
      console.log("Tipo de webhook no reconocido:", type);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(500).json({ error: "Error en webhook: " + error.message });
  }
};

// Endpoint de prueba para simular webhook de MP
const testWebhook = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    console.log("=== PRUEBA DE WEBHOOK ===");
    console.log("Orden ID:", orderId);
    console.log("Estado:", status);
    
    if (!orderId) {
      return res.status(400).json({ error: "orderId es requerido" });
    }
    
    // Obtener la orden
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
    
    // Actualizar estado
    const newStatus = status || 2; // Por defecto COMPLETED
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: newStatus },
    });
    
    // Enviar email
    if (order.user.email) {
      try {
        await sendPurchaseEmail(order.user.email, {
          id: order.id,
          total: order.total,
          date: order.createdAt,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          }))
        });
        console.log(`Email de confirmacion enviado a ${order.user.email}`);
      } catch (emailError) {
        console.error("Error al enviar email:", emailError);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Orden ${orderId} actualizada a estado ${newStatus}`,
      emailSent: !!order.user.email
    });
    
  } catch (error) {
    console.error("Error en test webhook:", error);
    res.status(500).json({ error: "Error en test webhook: " + error.message });
  }
};

// Obtener mis ordenes
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las ordenes" });
  }
};

// Obtener todas las ordenes (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las ordenes" });
  }
};

// Actualizar estado de la orden (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("Actualizando estado de orden:", { orderId, status });

    const statusNumber = parseInt(status);
    // Validar que el estado este dentro del rango valido usando constantes
    const validStatuses = Object.values(ORDER_STATUS);
    if (isNaN(statusNumber) || !validStatuses.includes(statusNumber)) {
      return res.status(400).json({ 
        error: `Estado invalido. Debe ser uno de: ${validStatuses.join(', ')}` 
      });
    }

    // Verificar que la orden existe y obtener informacion del usuario
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      }
    });

    if (!existingOrder) {
      return res.status(404).json({ 
        error: "Orden no encontrada" 
      });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: statusNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
      },
    });

    console.log("Orden actualizada exitosamente:", order.id);

    // Enviar email de actualizacion de estado si el usuario tiene email
    if (existingOrder.user && existingOrder.user.email) {
      try {
        await sendOrderStatusUpdateEmail(existingOrder.user.email, {
          id: order.id,
          total: order.total,
          date: order.createdAt,
          items: existingOrder.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          }))
        }, statusNumber);
        console.log(`Email de actualizacion de estado enviado a ${existingOrder.user.email}`);
      } catch (emailError) {
        console.error("Error al enviar email de actualizacion de estado:", emailError);
      }
    }

    res.json(order);
  } catch (error) {
    console.error("Error al actualizar el estado de la orden:", error);
    res.status(500).json({ 
      error: "Error al actualizar el estado de la orden: " + error.message 
    });
  }
};

// Cancelar orden
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("Intentando cancelar orden:", { orderId, userId, userRole });

    //Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
    });

    console.log("Orden encontrada:", order);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Verificar permisos: solo el propietario o administradores pueden cancelar
    const isOwner = order.userId === userId;
    const isAdmin = ["ADMIN", "SALES_MANAGER"].includes(userRole);
    
    console.log("Permisos:", { isOwner, isAdmin, orderUserId: order.userId, currentUserId: userId });
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: "No tienes permisos para cancelar esta orden. Solo el propietario o administradores pueden cancelarla." 
      });
    }

    // Verificar si la orden puede ser cancelada usando constantes descriptivas
    console.log("Estado actual de la orden:", order.status);
    console.log("Estados cancelables:", CANCELABLE_STATUSES);
    
    if (!CANCELABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({ 
        error: "La orden no puede ser cancelada en su estado actual" 
      });
    }

    console.log("Actualizando orden a estado CANCELLED (3)");

    // Cambiar estado a CANCELLED
    const cancelledOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: ORDER_STATUS.CANCELLED },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        orderStatus: true,
      },
    });

    console.log("Orden cancelada exitosamente:", cancelledOrder.id);

    // Mensaje personalizado segun quien cancelo la orden
    const cancelMessage = isAdmin 
      ? "Orden cancelada correctamente por administrador"
      : "Orden cancelada correctamente";

    res.json({
      message: cancelMessage,
      order: cancelledOrder,
      cancelledBy: isAdmin ? "admin" : "owner"
    });
  } catch (error) {
    console.error("Error detallado al cancelar la orden:", error);
    res.status(500).json({ error: "Error al cancelar la orden: " + error.message });
  }
};

module.exports = {
  createOrder,
  handleWebhook,
  testWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
