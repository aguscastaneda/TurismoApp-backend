const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Manejar errores de Prisma
prisma.$on("error", (e) => {
  console.error("Prisma Error:", e);
});

// Obtener el carrito del usuario
const getCart = async (req, res) => {
  try {
    console.log("Obteniendo carrito de usuario:", req.user.id);
    
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      console.log("Carrito no encontrado, creando uno nuevo");
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    console.log("Carrito recuperado exitosamente:", { cartId: cart.id, total });
    
    res.json({
      cart: {
        id: cart.id,
        items: cart.items,
        total: total.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Agregar item al carrito
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "ID del producto es requerido" });
    }

    console.log("Agregando item al carrito:", {
      userId: req.user.id,
      productId,
      quantity,
    });

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
        },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles` 
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId),
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente. Solo puedes agregar ${product.stock - existingItem.quantity} unidades más` 
        });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });

      console.log("Item agregado exitosamente:", { cartItemId: updatedItem.id });
      
      res.json({
        message: "Cantidad actualizada en el carrito",
        item: updatedItem,
      });
    } else {
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity,
        },
        include: {
          product: true,
        },
      });

      console.log("Item agregado exitosamente:", { cartItemId: cartItem.id });
      
      res.status(201).json({
        message: "Producto agregado al carrito",
        item: cartItem,
      });
    }
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar cantidad de item
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Cantidad debe ser mayor a 0" });
    }

    console.log("Actualizacion de la cantidad de articulos:", {
      itemId,
      newQuantity: quantity,
    });

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item del carrito no encontrado" });
    }

    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: "No tienes permisos para modificar este carrito" });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Solo quedan ${cartItem.product.stock} unidades disponibles` 
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity },
      include: {
        product: true,
      },
    });

    console.log("Cantidad de items actualizada correctamente:", {
      itemId,
      newQuantity: quantity,
    });

    res.json({
      message: "Cantidad actualizada",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error al actualizar item del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar item del carrito
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log("Eliminando item del carrito:", { itemId });

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item del carrito no encontrado" });
    }

    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este item" });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) },
    });

    console.log("Item eliminado correctamente:", { itemId });

    res.json({
      message: "Producto eliminado del carrito",
    });
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Vaciar carrito
const clearCart = async (req, res) => {
  try {
    console.log("Vaciando carrito de usuario:", req.user.id);

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log("Carrito vaciado correctamente");

    res.json({
      message: "Carrito vaciado exitosamente",
    });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
