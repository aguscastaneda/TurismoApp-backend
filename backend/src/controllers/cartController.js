const prisma = require("../config/prisma");

// Manejar errores de Prisma
prisma.$on("error", (e) => {
  console.error("Prisma Error:", e);
});

// Obtener el carrito del usuario
const getCart = async (req, res) => {
  try {
    console.log("Obteniendo carrito de usuario..", req.user.id);

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
      console.log("Carrito no encontrado, creando uno nuevo..");
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

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    console.log("Carrito recuperado exitosamente:", { cartId: cart.id, total });
    res.json({ ...cart, total });
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res
      .status(500)
      .json({ error: "Error al obtener el carrito: " + error.message });
  }
};

// Agregar item al carrito
const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    console.log("Agregando item al carrito:", {
      userId: req.user.id,
      productId,
      quantity,
    });

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ error: "ProductId y quantity son requeridos" });
    }

    // Verificar que el producto existe y tiene stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    // Obtener o crear carrito
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    // Buscar si el item ya existe en el carrito
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        unique_cart_product: {
          cartId: cart.id,
          productId: parseInt(productId),
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Si existe, actualizar la cantidad
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      // Si no existe, crear nuevo item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: quantity,
        },
      });
    }

    // Obtener carrito actualizado
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const total = updatedCart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    console.log("Item agregado exitosamente:", { cartItemId: cartItem.id });
    res.json({ ...updatedCart, total });
  } catch (error) {
    console.error("Error al agregar item al carrito:", error);
    res
      .status(500)
      .json({ error: "Error al agregar item al carrito: " + error.message });
  }
};

// Actualizar cantidad de item
const updateItemQuantity = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { quantity } = req.body;
    console.log("Actualizacion de la cantidad de articulos:", {
      itemId,
      quantity,
    });

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "ID de item invalido" });
    }

    // Verificar que el item existe
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    // Verificar que el carrito pertenece al usuario
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Verificar stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    // Actualizar cantidad
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
      },
    });

    // Obtener carrito actualizado
    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    console.log("Cantidad de items actualizada correctamente:", {
      itemId: updatedItem.id,
    });
    res.json({ ...cart, total });
  } catch (error) {
    console.error("Error al actualizar la cantidad del items:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar cantidad: " + error.message });
  }
};

// Eliminar item del carrito
const removeItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    console.log("Eliminando item del carrito:", { itemId });

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "ID de item inválido" });
    }

    // Verificar que el item existe
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    // Verificar que el carrito pertenece al usuario
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Eliminar item
    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    // Obtener carrito actualizado
    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    console.log("Item eliminado correctamente:", { itemId });
    res.json({ ...cart, total });
  } catch (error) {
    console.error("Error al eliminar item del carrito:", error);
    res.status(500).json({ error: "Error al eliminar item: " + error.message });
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

    // Eliminar todos los items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log("Carrito vaciado correctamente");
    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    console.error("Error vaciando carrito:", error);
    res
      .status(500)
      .json({ error: "Error al vaciar carrito: " + error.message });
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
