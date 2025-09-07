const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    console.log('✅ RabbitMQ conectado');
    
    // Configurar exchanges y colas
    await setupQueues();
    
    return { connection, channel };
  } catch (error) {
    console.error('❌ Error conectando RabbitMQ:', error);
    throw error;
  }
}

async function setupQueues() {
  // Exchange para emails
  await channel.assertExchange('email_exchange', 'direct', { durable: true });
  await channel.assertQueue('email_queue', { durable: true });
  await channel.bindQueue('email_queue', 'email_exchange', 'email');
  
  // Exchange para webhooks
  await channel.assertExchange('webhook_exchange', 'direct', { durable: true });
  await channel.assertQueue('webhook_queue', { durable: true });
  await channel.bindQueue('webhook_queue', 'webhook_exchange', 'webhook');
  
  // Exchange para stock
  await channel.assertExchange('stock_exchange', 'direct', { durable: true });
  await channel.assertQueue('stock_queue', { durable: true });
  await channel.bindQueue('stock_queue', 'stock_exchange', 'stock');
}

module.exports = { connectRabbitMQ, getChannel: () => channel };