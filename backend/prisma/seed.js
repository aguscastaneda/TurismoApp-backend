const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  try {
    // Crear estados de orden
    console.log("Creando estados de orden...");
    await prisma.orderStatus.createMany({
      data: [
        { id: 0, name: "PENDING" },
        { id: 1, name: "PROCESSING" },
        { id: 2, name: "COMPLETED" },
        { id: 3, name: "CANCELLED" },
      ],
      skipDuplicates: true,
    });

    // Crear usuario administrador
    console.log("Creando usuario administrador...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Administrador",
        role: "SALES_MANAGER",
      },
    });

    // Crear usuario cliente
    console.log("Creando usuario cliente...");
    const clientPassword = await bcrypt.hash("client123", 10);
    await prisma.user.create({
      data: {
        email: "client@example.com",
        password: clientPassword,
        name: "Cliente",
        role: "CLIENT",
      },
    });

    // Crear productos de ejemplo
    console.log("Creando productos de ejemplo...");
    await prisma.product.createMany({
      data: [
        {
          name: "Producto 1",
          description: "Descripcion del producto 1",
          price: 100.0,
          stock: 10,
          image: "https://via.placeholder.com/150",
        },
        {
          name: "Producto 2",
          description: "Descripcion del producto 2",
          price: 200.0,
          stock: 20,
          image: "https://via.placeholder.com/150",
        },
        {
          name: "Producto 3",
          description: "Descripcion del producto 3",
          price: 300.0,
          stock: 30,
          image: "https://via.placeholder.com/150",
        },
      ],
    });

    console.log("Seed completado exitosamente");
  } catch (error) {
    console.error("Error durante el seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
