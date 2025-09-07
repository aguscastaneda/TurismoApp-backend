require('dotenv').config();
const amqp = require('amqplib');
const { PrismaClient } = require('@prisma/client');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { publishToQueue } = require('../utils/queue');

const prisma = new PrismaClient();
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

async function startWebhookWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    console.log('✅ Webhook Worker conectado');
    
    // Configurar cola
    await channel.assertQueue('webhook_queue', { durable: true });
    await channel.prefetch(1);
    
    console.log('�� Esperando webhooks...');
    
    channel.consume('webhook_queue', async (msg) => {
      if (msg) {
        try {
          const { data, type } = JSON.parse(msg.content.toString());
          console.log(`�� Procesando webhook: ${type}`);
          
          if (type === "payment") {
            const paymentData = await new Payment(client).get({ paymentId: data.id });
            const orderId = paymentData.external_reference;
            
            if (paymentData.status === "approved") {
              const order = await prisma.orders.update({
                where: { id: parseInt(orderId) },
                data: { status: 2 }, // COMPLETED
                include: {
                  user: true,
                  items: {
                    include: {
                      product: true,
                    },
                  },
                },
              });
              
              // Encolar email de confirmación
              await publishToQueue('email_exchange', 'email', {
                type: 'orderConfirmed',
                data: { email: order.user.email, order }
              });
              
              // Actualizar stock
              await publishToQueue('stock_exchange', 'stock', {
                type: 'updateStock',
                data: { items: order.items }
              });
              
            } else if (paymentData.status === "pending") {
              const order = await prisma.orders.update({
                where: { id: parseInt(orderId) },
                data: { status: 0 }, // PENDING
                include: {
                  user: true,
                  items: {
                    include: {
                      product: true,
                    },
                  },
                },
              });
              
              await publishToQueue('email_exchange', 'email', {
                type: 'orderStatusUpdate',
                data: { email: order.user.email, order, status: 0 }
              });
            }
          }
          
          console.log(`✅ Webhook procesado exitosamente`);
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error procesando webhook:', error);
          channel.nack(msg, false, false);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en Webhook Worker:', error);
    process.exit(1);
  }
}

startWebhookWorker();