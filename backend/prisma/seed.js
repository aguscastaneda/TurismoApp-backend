const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const products = [
  {
    name: "Paquete Aventura en la Montaña",
    description: "Disfruta de 3 días y 2 noches en las montañas con actividades de senderismo, camping y vistas espectaculares. Incluye alojamiento, comidas y guía turístico.",
    price: 299.99,
    stock: 10,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
  },
  {
    name: "Escape a la Playa",
    description: "Relájate en hermosas playas por 4 días y 3 noches. Incluye hotel frente al mar, actividades acuáticas, snorkel y cenas románticas.",
    price: 449.99,
    stock: 15,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"
  },
  {
    name: "Tour Cultural por la Ciudad",
    description: "Explora la historia y cultura de la ciudad en 2 días. Visita museos, monumentos históricos, restaurantes locales y espectáculos tradicionales.",
    price: 199.99,
    stock: 20,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500"
  },
  {
    name: "Aventura en la Selva",
    description: "Vive una experiencia única en la selva por 5 días. Incluye expediciones, observación de fauna, alojamiento en eco-lodge y guías expertos.",
    price: 599.99,
    stock: 8,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500"
  },
  {
    name: "Retiro de Yoga y Bienestar",
    description: "Renueva tu mente y cuerpo en un retiro de 3 días. Incluye clases de yoga, meditación, spa, alimentación saludable y alojamiento tranquilo.",
    price: 349.99,
    stock: 12,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"
  },
  {
    name: "Crucero por el Río",
    description: "Navega por hermosos ríos en un crucero de lujo por 4 días. Incluye cabina privada, restaurante gourmet, actividades a bordo y excursiones.",
    price: 799.99,
    stock: 6,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500"
  }
];

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  const orderStatuses = [
    { id: 0, name: 'PENDING' },
    { id: 1, name: 'PROCESSING' },
    { id: 2, name: 'COMPLETED' },
    { id: 3, name: 'CANCELLED' }
  ];

  for (const status of orderStatuses) {
    await prisma.orderStatus.upsert({
      where: { id: status.id },
      update: { name: status.name },
      create: status
    });
  }

  console.log('✅ Estados de orden creados');

  // Crear productos de ejemplo
  const products = [
    {
      name: 'Buenos Aires - Bariloche',
      description: 'Aventura en la Patagonia con vistas espectaculares de los lagos y montañas',
      price: 450.00,
      stock: 15,
      destination: 'Bariloche',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
    },
    {
      name: 'Buenos Aires - Iguazú',
      description: 'Maravillas naturales con las cataratas más impresionantes del mundo',
      price: 380.00,
      stock: 20,
      destination: 'Iguazu',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
    },
    {
      name: 'Buenos Aires - Mendoza',
      description: 'Ruta del vino con degustaciones y paisajes de montaña',
      price: 320.00,
      stock: 12,
      destination: 'Mendoza',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
    },
    {
      name: 'Buenos Aires - Salta',
      description: 'Cultura y tradición en el norte argentino',
      price: 280.00,
      stock: 18,
      destination: 'Salta',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
    },
    {
      name: 'Buenos Aires - Ushuaia',
      description: 'Fin del mundo con glaciares y pingüinos',
      price: 650.00,
      stock: 8,
      destination: 'Ushuaia',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
    },
    {
      name: 'Buenos Aires - Córdoba',
      description: 'Sierras y cultura en el corazón de Argentina',
      price: 220.00,
      stock: 25,
      destination: 'Cordoba',
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80'
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('✅ Productos creados');

  // Crear usuario admin de ejemplo
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Usuario admin creado (admin@example.com / admin123)');

  // Crear usuario cliente de ejemplo
  const clientPassword = await bcrypt.hash('client123', 10);
  
  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Cliente Ejemplo',
      email: 'client@example.com',
      password: clientPassword,
      role: 'CLIENT'
    }
  });

  console.log('✅ Usuario cliente creado (client@example.com / client123)');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
