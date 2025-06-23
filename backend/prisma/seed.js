const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar la base de datos
  console.log('🧹 Limpiando base de datos...');
  
  // Desactivar restricciones de clave foránea temporalmente
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  
  // Eliminar todos los datos
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.orderStatus.deleteMany();
  await prisma.user.deleteMany();
  
  // Reactivar restricciones de clave foránea
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
  
  console.log('✅ Base de datos limpiada');

  // Crear estados de orden
  console.log('📋 Creando estados de orden...');
  const orderStatuses = [
    { id: 0, name: 'PENDING' },
    { id: 1, name: 'PROCESSING' },
    { id: 2, name: 'COMPLETED' },
    { id: 3, name: 'CANCELLED' }
  ];

  for (const status of orderStatuses) {
    await prisma.orderStatus.create({
      data: status
    });
  }
  console.log('✅ Estados de orden creados');

  // Crear productos de ejemplo
  console.log('🏖️ Creando paquetes turísticos...');
  const products = [
    {
      name: 'Buenos Aires - Bariloche',
      description: 'Aventura en la Patagonia con vistas espectaculares de los lagos y montañas. Disfruta del esquí en invierno y senderismo en verano.',
      price: 450.00,
      stock: 15,
      destination: 'Bariloche',
      image: '/images/bariloche.jpg'
    },
    {
      name: 'Buenos Aires - Iguazú',
      description: 'Maravillas naturales con las cataratas más impresionantes del mundo. Experiencia única en la selva misionera.',
      price: 380.00,
      stock: 20,
      destination: 'Iguazú',
      image: '/images/iguazujpg.jpg'
    },
    {
      name: 'Buenos Aires - Mendoza',
      description: 'Ruta del vino con degustaciones y paisajes de montaña. Visita bodegas tradicionales y disfruta de la gastronomía local.',
      price: 320.00,
      stock: 12,
      destination: 'Mendoza',
      image: '/images/mendoza.jpeg'
    },
    {
      name: 'Buenos Aires - Salta',
      description: 'Cultura y tradición en el norte argentino. Explora la Quebrada de Humahuaca y la rica historia colonial.',
      price: 280.00,
      stock: 18,
      destination: 'Salta',
      image: '/images/salta.jpg'
    },
    {
      name: 'Buenos Aires - Ushuaia',
      description: 'Fin del mundo con glaciares y pingüinos. Aventura en la Tierra del Fuego con paisajes únicos.',
      price: 650.00,
      stock: 8,
      destination: 'Ushuaia',
      image: '/images/ushuaiajpg.jpg'
    },
    {
      name: 'Buenos Aires - Córdoba',
      description: 'Sierras y cultura en el corazón de Argentina. Disfruta de las sierras cordobesas y la vida nocturna estudiantil.',
      price: 220.00,
      stock: 25,
      destination: 'Córdoba',
      image: '/images/cordoba.jpg'
    },
    {
      name: 'Buenos Aires - Río de Janeiro',
      description: 'Carnaval, playas y samba en la ciudad maravillosa. Experiencia brasileña completa con Copacabana e Ipanema.',
      price: 580.00,
      stock: 10,
      destination: 'Río de Janeiro',
      image: '/images/rio-janeiro.jpg'
    },
    {
      name: 'Buenos Aires - Santiago de Chile',
      description: 'Capital chilena con viñedos y montañas. Disfruta de la cultura chilena y los vinos del Valle del Maipo.',
      price: 420.00,
      stock: 14,
      destination: 'Santiago de Chile',
      image: '/images/santiago-chile.jpg'
    },
    {
      name: 'Buenos Aires - Lima',
      description: 'Gastronomía peruana y cultura inca. Explora la ciudad de los reyes y sus sabores únicos.',
      price: 480.00,
      stock: 12,
      destination: 'Lima',
      image: '/images/lima.jpeg'
    },
    {
      name: 'Buenos Aires - Bogotá',
      description: 'Capital colombiana con historia y modernidad. Descubre la cultura cafetera y la arquitectura colonial.',
      price: 520.00,
      stock: 8,
      destination: 'Bogotá',
      image: '/images/bogota.jpeg'
    },
    {
      name: 'Buenos Aires - Ciudad de México',
      description: 'Cultura azteca y modernidad mexicana. Explora el Zócalo, Teotihuacán y la gastronomía local.',
      price: 550.00,
      stock: 10,
      destination: 'Ciudad de México',
      image: '/images/mexico.jpg'
    },
    {
      name: 'Buenos Aires - Nueva York',
      description: 'La ciudad que nunca duerme. Times Square, Central Park y la Estatua de la Libertad te esperan.',
      price: 1200.00,
      stock: 6,
      destination: 'Nueva York',
      image: '/images/new-york.jpg'
    },
    {
      name: 'Buenos Aires - París',
      description: 'La ciudad del amor y la luz. Torre Eiffel, Louvre y los Campos Elíseos en la capital francesa.',
      price: 1400.00,
      stock: 5,
      destination: 'París',
      image: '/images/paris.jpg'
    },
    {
      name: 'Buenos Aires - Tokio',
      description: 'Tecnología y tradición japonesa. Sumérgete en la cultura del sol naciente con templos y neón.',
      price: 1800.00,
      stock: 4,
      destination: 'Tokio',
      image: '/images/tokio.jpg'
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }
  console.log(`✅ ${products.length} paquetes turísticos creados`);

  // Crear usuario admin de ejemplo
  console.log('👨‍💼 Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('✅ Usuario admin creado (admin@example.com / admin123)');

  // Crear usuario cliente de ejemplo
  console.log('👤 Creando usuario cliente...');
  const clientPassword = await bcrypt.hash('client123', 10);
  
  await prisma.user.create({
    data: {
      name: 'Cliente Ejemplo',
      email: 'client@example.com',
      password: clientPassword,
      role: 'CLIENT'
    }
  });
  console.log('✅ Usuario cliente creado (client@example.com / client123)');

  console.log('🎉 ¡Seed completado exitosamente!');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   • ${orderStatuses.length} estados de orden`);
  console.log(`   • ${products.length} paquetes turísticos`);
  console.log('   • 2 usuarios de ejemplo');
  console.log('');
  console.log('🔑 Credenciales:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Cliente: client@example.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
