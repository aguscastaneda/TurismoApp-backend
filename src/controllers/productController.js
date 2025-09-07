<<<<<<< HEAD
const { PrismaClient } = require("@prisma/client");
const { getCache, setCache, delCache, CACHE_KEYS } = require("../utils/cache");
const prisma = new PrismaClient();

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const cacheKey = CACHE_KEYS.PRODUCTS_ALL;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const products = await prisma.product.findMany();
    await setCache(cacheKey, products, parseInt(process.env.CACHE_TTL_PRODUCTS || "300", 10));
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ 
      error: "Error al obtener productos",
      details: error.message 
    });
  }
};

// Obtener un producto por ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = CACHE_KEYS.PRODUCT(id);
    const cached = await getCache(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await setCache(cacheKey, product, parseInt(process.env.CACHE_TTL_PRODUCT || "600", 10));
    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ 
      error: "Error al obtener producto",
      details: error.message 
    });
  }
};

// Crear un nuevo producto (solo admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, destination, image } = req.body;

    // Validar datos requeridos
    if (!name || !price || stock === undefined) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos: name, price, stock" 
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        destination,
        image,
      },
    });

    // Invalidar cache
    await delCache(CACHE_KEYS.PRODUCTS_ALL);
    await delCache("products:*");

    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ 
      error: "Error al crear producto",
      details: error.message 
    });
  }
};

// Actualizar un producto (solo admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, destination, image } = req.body;
    const productId = parseInt(id);

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        destination,
        image,
      },
    });

    // Invalidar cache
    await delCache(CACHE_KEYS.PRODUCTS_ALL);
    await delCache(CACHE_KEYS.PRODUCT(productId));

    res.json(product);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ 
      error: "Error al actualizar producto",
      details: error.message 
    });
  }
};

// Eliminar un producto (solo admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    // Verificar si el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar en una transacción para mantener la integridad de los datos
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar items del carrito que referencian este producto
      await tx.cartItem.deleteMany({
        where: { productId: productId },
      });

      // 2. Eliminar items de órdenes que referencian este producto
      await tx.orderItem.deleteMany({
        where: { productId: productId },
      });

      // 3. Finalmente eliminar el producto
      await tx.product.delete({
        where: { id: productId },
      });
    });

    // Invalidar cache
    await delCache(CACHE_KEYS.PRODUCTS_ALL);
    await delCache(CACHE_KEYS.PRODUCT(productId));

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ 
      error: "Error al eliminar producto",
      details: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
=======
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ 
      error: "Error al obtener productos",
      details: error.message 
    });
  }
};

// Obtener un producto por ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ 
      error: "Error al obtener producto",
      details: error.message 
    });
  }
};

// Crear un nuevo producto (solo admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, destination, image } = req.body;

    // Validar datos requeridos
    if (!name || !price || stock === undefined) {
      return res.status(400).json({ 
        error: "Faltan datos requeridos: name, price, stock" 
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        destination,
        image,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ 
      error: "Error al crear producto",
      details: error.message 
    });
  }
};

// Actualizar un producto (solo admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, destination, image } = req.body;
    const productId = parseInt(id);

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        destination,
        image,
      },
    });

    res.json(product);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ 
      error: "Error al actualizar producto",
      details: error.message 
    });
  }
};

// Eliminar un producto (solo admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    // Verificar si el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar en una transacción para mantener la integridad de los datos
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar items del carrito que referencian este producto
      await tx.cartItem.deleteMany({
        where: { productId: productId },
      });

      // 2. Eliminar items de órdenes que referencian este producto
      await tx.orderItem.deleteMany({
        where: { productId: productId },
      });

      // 3. Finalmente eliminar el producto
      await tx.product.delete({
        where: { id: productId },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ 
      error: "Error al eliminar producto",
      details: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
>>>>>>> 3041717f4d41692ba8121d8e57b07eb59286eb89
