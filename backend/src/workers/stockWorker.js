require('dotenv').config();
const amqp = require('amqplib');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startStockWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    console.log('✅ Stock Worker conectado');
    
    // Configurar cola
    await channel.assertQueue('stock_queue', { durable: true });
    await channel.prefetch(1);
    
    console.log('�� Esperando actualizaciones de stock...');
    
    channel.consume('stock_queue', async (msg) => {
      if (msg) {
        try {
          const { type, data } = JSON.parse(msg.content.toString());
          console.log(`📦 Procesando stock: ${type}`);
          
          if (type === 'updateStock') {
            for (const item of data.items) {
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            }
            console.log(`✅ Stock actualizado para ${data.items.length} productos`);
          }
          
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error actualizando stock:', error);
          channel.nack(msg, false, false);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en Stock Worker:', error);
    process.exit(1);
  }
}

startStockWorker();