require('dotenv').config();
const amqp = require('amqplib');
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCreatedEmail,
} = require('../config/email');

async function startEmailWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    console.log('✅ Email Worker conectado');
    
    // Configurar cola
    await channel.assertQueue('email_queue', { durable: true });
    await channel.prefetch(1); // Procesar un mensaje a la vez
    
    console.log('�� Esperando mensajes de email...');
    
    channel.consume('email_queue', async (msg) => {
      if (msg) {
        try {
          const { type, data } = JSON.parse(msg.content.toString());
          console.log(`📧 Procesando email: ${type}`);
          
          switch (type) {
            case 'orderCreated':
              await sendOrderCreatedEmail(data.email, data.order);
              break;
            case 'orderConfirmed':
              await sendOrderConfirmationEmail(data.email, data.order);
              break;
            case 'orderStatusUpdate':
              await sendOrderStatusUpdateEmail(data.email, data.order, data.status);
              break;
            default:
              console.log(`❌ Tipo de email no reconocido: ${type}`);
          }
          
          console.log(`✅ Email ${type} enviado exitosamente`);
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error procesando email:', error);
          channel.nack(msg, false, false); // Rechazar mensaje
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en Email Worker:', error);
    process.exit(1);
  }
}

startEmailWorker();