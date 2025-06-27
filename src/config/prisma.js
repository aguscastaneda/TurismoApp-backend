const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Manejar errores de Prisma
prisma.$on("error", (e) => {
  console.error("Prisma Error:", e);
});

module.exports = prisma;
