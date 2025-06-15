const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
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
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

// Crear un nuevo producto (solo admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// Actualizar un producto (solo admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
      },
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// Eliminar un producto (solo admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
