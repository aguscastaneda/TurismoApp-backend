const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear estados de orden
  console.log('Creando estados de orden...');
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
  console.log('Estados de orden creados');

  // Crear productos
  console.log('Creando paquetes turísticos...');
  const products = [
    // Bariloche
    {
      name: 'Buenos Aires - Bariloche (Básico)',
      description: 'Solo viaje: Vuelo a la ciudad de los lagos para tu propia aventura.',
      price: 250.00,
      stock: 10,
      image: '/images/bariloche.jpg',
      destination: 'Bariloche'
    },
    {
      name: 'Buenos Aires - Bariloche (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel con vista al lago Nahuel Huapi. Incluye desayuno.',
      price: 350.00,
      stock: 10,
      image: '/images/bariloche.jpg',
      destination: 'Bariloche'
    },
    {
      name: 'Buenos Aires - Bariloche (Aventura)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y excursión guiada al Cerro Catedral. Incluye traslados.',
      price: 450.00,
      stock: 8,
      image: '/images/bariloche.jpg',
      destination: 'Bariloche'
    },
    {
      name: 'Buenos Aires - Bariloche (Full Experience)',
      description: 'Viaje + alojamiento + vehículo + excursión: Vuelo, hotel, alquiler de auto y excursión a los Siete Lagos.',
      price: 600.00,
      stock: 5,
      image: '/images/bariloche.jpg',
      destination: 'Bariloche'
    },
    // Iguazú
    {
      name: 'Buenos Aires - Iguazú (Básico)',
      description: 'Solo viaje: Vuelo a la selva misionera para explorar a tu manera.',
      price: 180.00,
      stock: 10,
      image: '/images/iguazujpg.jpg',
      destination: 'Iguazú'
    },
    {
      name: 'Buenos Aires - Iguazú (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y eco-lodge en plena selva. Incluye desayuno buffet.',
      price: 280.00,
      stock: 10,
      image: '/images/iguazujpg.jpg',
      destination: 'Iguazú'
    },
    {
      name: 'Buenos Aires - Iguazú (Aventura)',
      description: 'Viaje + alojamiento + excursión: Vuelo, eco-lodge y excursión a las Cataratas con paseo en lancha.',
      price: 380.00,
      stock: 8,
      image: '/images/iguazujpg.jpg',
      destination: 'Iguazú'
    },
    // Mendoza
    {
      name: 'Buenos Aires - Mendoza (Básico)',
      description: 'Solo viaje: Vuelo a la tierra del sol y el buen vino.',
      price: 150.00,
      stock: 10,
      image: '/images/mendoza.jpeg',
      destination: 'Mendoza'
    },
    {
      name: 'Buenos Aires - Mendoza (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel céntrico. Incluye desayuno y copa de bienvenida.',
      price: 220.00,
      stock: 10,
      image: '/images/mendoza.jpeg',
      destination: 'Mendoza'
    },
    {
      name: 'Buenos Aires - Mendoza (Con auto)',
      description: 'Viaje + alojamiento + vehículo: Vuelo, hotel y alquiler de auto para recorrer bodegas.',
      price: 320.00,
      stock: 8,
      image: '/images/mendoza.jpeg',
      destination: 'Mendoza'
    },
    // Salta
    {
      name: 'Buenos Aires - Salta (Básico)',
      description: 'Solo viaje: Vuelo al norte argentino para descubrir la cultura salteña.',
      price: 120.00,
      stock: 10,
      image: '/images/salta.jpg',
      destination: 'Salta'
    },
    {
      name: 'Buenos Aires - Salta (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y casona colonial en el centro histórico. Incluye desayuno regional.',
      price: 200.00,
      stock: 10,
      image: '/images/salta.jpg',
      destination: 'Salta'
    },
    {
      name: 'Buenos Aires - Salta (Aventura)',
      description: 'Viaje + alojamiento + excursión: Vuelo, casona colonial y excursión a la Quebrada de Humahuaca.',
      price: 280.00,
      stock: 8,
      image: '/images/salta.jpg',
      destination: 'Salta'
    },
    {
      name: 'Buenos Aires - Salta (Con auto)',
      description: 'Viaje + alojamiento + vehículo: Vuelo, casona colonial y alquiler de auto para recorrer los Valles Calchaquíes.',
      price: 350.00,
      stock: 5,
      image: '/images/salta.jpg',
      destination: 'Salta'
    },
    // Ushuaia
    {
      name: 'Buenos Aires - Ushuaia (Básico)',
      description: 'Solo viaje: Vuelo al fin del mundo para tu propia aventura.',
      price: 400.00,
      stock: 5,
      image: '/images/ushuaiajpg.jpg',
      destination: 'Ushuaia'
    },
    {
      name: 'Buenos Aires - Ushuaia (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel con vista al canal Beagle. Incluye desayuno.',
      price: 500.00,
      stock: 5,
      image: '/images/ushuaiajpg.jpg',
      destination: 'Ushuaia'
    },
    {
      name: 'Buenos Aires - Ushuaia (Aventura)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y excursión a glaciares y pingüinera.',
      price: 600.00,
      stock: 4,
      image: '/images/ushuaiajpg.jpg',
      destination: 'Ushuaia'
    },
    {
      name: 'Buenos Aires - Ushuaia (Full Experience)',
      description: 'Viaje + alojamiento + vehículo + excursión: Vuelo, hotel, alquiler de 4x4 y excursión a glaciares.',
      price: 750.00,
      stock: 2,
      image: '/images/ushuaiajpg.jpg',
      destination: 'Ushuaia'
    },
    // Córdoba
    {
      name: 'Buenos Aires - Córdoba (Básico)',
      description: 'Solo viaje: Vuelo a la Docta para disfrutar de las sierras y la cultura.',
      price: 90.00,
      stock: 15,
      image: '/images/cordoba.jpg',
      destination: 'Córdoba'
    },
    {
      name: 'Buenos Aires - Córdoba (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel céntrico. Incluye desayuno.',
      price: 150.00,
      stock: 10,
      image: '/images/cordoba.jpg',
      destination: 'Córdoba'
    },
    // Río de Janeiro
    {
      name: 'Buenos Aires - Río de Janeiro (Básico)',
      description: 'Solo viaje: Vuelo a la ciudad maravillosa para vivir el carnaval a tu manera.',
      price: 350.00,
      stock: 8,
      image: '/images/rio-janeiro.jpg',
      destination: 'Río de Janeiro'
    },
    {
      name: 'Buenos Aires - Río de Janeiro (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel en Copacabana. Incluye desayuno.',
      price: 450.00,
      stock: 8,
      image: '/images/rio-janeiro.jpg',
      destination: 'Río de Janeiro'
    },
    {
      name: 'Buenos Aires - Río de Janeiro (Aventura)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y tour guiado al Cristo Redentor y Pan de Azúcar.',
      price: 580.00,
      stock: 6,
      image: '/images/rio-janeiro.jpg',
      destination: 'Río de Janeiro'
    },
    // Santiago de Chile
    {
      name: 'Buenos Aires - Santiago de Chile (Básico)',
      description: 'Solo viaje: Vuelo a la capital chilena para explorar viñedos y montañas.',
      price: 200.00,
      stock: 8,
      image: '/images/santiago-chile.jpg',
      destination: 'Santiago de Chile'
    },
    {
      name: 'Buenos Aires - Santiago de Chile (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel boutique en el centro. Incluye desayuno.',
      price: 300.00,
      stock: 8,
      image: '/images/santiago-chile.jpg',
      destination: 'Santiago de Chile'
    },
    {
      name: 'Buenos Aires - Santiago de Chile (Con auto)',
      description: 'Viaje + alojamiento + vehículo: Vuelo, hotel y alquiler de auto para recorrer el Valle del Maipo.',
      price: 420.00,
      stock: 6,
      image: '/images/santiago-chile.jpg',
      destination: 'Santiago de Chile'
    },
    // Lima
    {
      name: 'Buenos Aires - Lima (Básico)',
      description: 'Solo viaje: Vuelo a la ciudad de los reyes para descubrir la cultura peruana.',
      price: 250.00,
      stock: 8,
      image: '/images/lima.jpeg',
      destination: 'Lima'
    },
    {
      name: 'Buenos Aires - Lima (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel en Miraflores. Incluye desayuno.',
      price: 350.00,
      stock: 8,
      image: '/images/lima.jpeg',
      destination: 'Lima'
    },
    {
      name: 'Buenos Aires - Lima (Gourmet)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y tour culinario por los mejores restaurantes y mercados.',
      price: 480.00,
      stock: 6,
      image: '/images/lima.jpeg',
      destination: 'Lima'
    },
    // Bogotá
    {
      name: 'Buenos Aires - Bogotá (Básico)',
      description: 'Solo viaje: Vuelo a la capital colombiana para explorar museos y cultura cafetera.',
      price: 320.00,
      stock: 6,
      image: '/images/bogota.jpeg',
      destination: 'Bogotá'
    },
    {
      name: 'Buenos Aires - Bogotá (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel céntrico. Incluye desayuno típico.',
      price: 420.00,
      stock: 6,
      image: '/images/bogota.jpeg',
      destination: 'Bogotá'
    },
    // Ciudad de México
    {
      name: 'Buenos Aires - Ciudad de México (Básico)',
      description: 'Solo viaje: Vuelo a la capital azteca para descubrir su historia y gastronomía.',
      price: 350.00,
      stock: 6,
      image: '/images/mexico.jpg',
      destination: 'Ciudad de México'
    },
    {
      name: 'Buenos Aires - Ciudad de México (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel en el Zócalo. Incluye desayuno.',
      price: 450.00,
      stock: 6,
      image: '/images/mexico.jpg',
      destination: 'Ciudad de México'
    },
    {
      name: 'Buenos Aires - Ciudad de México (Aventura)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y excursión a Teotihuacán y Xochimilco con guía.',
      price: 550.00,
      stock: 4,
      image: '/images/mexico.jpg',
      destination: 'Ciudad de México'
    },
    // Nueva York
    {
      name: 'Buenos Aires - Nueva York (Básico)',
      description: 'Solo viaje: Vuelo a la ciudad que nunca duerme para vivir tu propia película.',
      price: 900.00,
      stock: 4,
      image: '/images/new-york.jpg',
      destination: 'Nueva York'
    },
    {
      name: 'Buenos Aires - Nueva York (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel en Manhattan. Incluye desayuno.',
      price: 1100.00,
      stock: 4,
      image: '/images/new-york.jpg',
      destination: 'Nueva York'
    },
    {
      name: 'Buenos Aires - Nueva York (Con auto)',
      description: 'Viaje + alojamiento + vehículo: Vuelo, hotel y alquiler de auto para recorrer la ciudad y sus alrededores.',
      price: 1200.00,
      stock: 2,
      image: '/images/new-york.jpg',
      destination: 'Nueva York'
    },
    // París
    {
      name: 'Buenos Aires - París (Básico)',
      description: 'Solo viaje: Vuelo a la ciudad del amor para descubrir París a tu manera.',
      price: 1100.00,
      stock: 2,
      image: '/images/paris.jpg',
      destination: 'París'
    },
    {
      name: 'Buenos Aires - París (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel cerca de la Torre Eiffel. Incluye desayuno.',
      price: 1250.00,
      stock: 2,
      image: '/images/paris.jpg',
      destination: 'París'
    },
    {
      name: 'Buenos Aires - París (Romántico)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y tour guiado por el Louvre y Montmartre.',
      price: 1400.00,
      stock: 1,
      image: '/images/paris.jpg',
      destination: 'París'
    },
    // Tokio
    {
      name: 'Buenos Aires - Tokio (Básico)',
      description: 'Solo viaje: Vuelo a la tierra del sol naciente para vivir la cultura japonesa.',
      price: 1500.00,
      stock: 1,
      image: '/images/tokio.jpg',
      destination: 'Tokio'
    },
    {
      name: 'Buenos Aires - Tokio (Con alojamiento)',
      description: 'Viaje + alojamiento: Vuelo y hotel en Shibuya. Incluye desayuno.',
      price: 1650.00,
      stock: 1,
      image: '/images/tokio.jpg',
      destination: 'Tokio'
    },
    {
      name: 'Buenos Aires - Tokio (Cultural)',
      description: 'Viaje + alojamiento + excursión: Vuelo, hotel y excursión guiada a templos y barrios tradicionales.',
      price: 1800.00,
      stock: 1,
      image: '/images/tokio.jpg',
      destination: 'Tokio'
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }
  console.log(`${products.length} paquetes turísticos creados`);

  // Crear credenciales
  console.log('Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Usuario admin creado (admin@example.com / admin123)');

  console.log('Creando usuario cliente...');
  const clientPassword = await bcrypt.hash('client123', 10);
  
  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {
      name: 'Cliente Ejemplo',
      password: clientPassword,
      role: 'CLIENT'
    },
    create: {
      name: 'Cliente Ejemplo',
      email: 'client@example.com',
      password: clientPassword,
      role: 'CLIENT'
    }
  });
  console.log('Usuario cliente creado (client@example.com / client123)');

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
