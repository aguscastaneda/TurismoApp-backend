const { getChannel } = require('../config/rabbitmq');

async function publishToQueue(exchange, routingKey, message) {
  try {
    const channel = getChannel();
    if (!channel) {
      throw new Error('RabbitMQ channel no disponible');
    }
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    const published = channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      timestamp: Date.now()
    });
    
    if (!published) {
      throw new Error('No se pudo publicar mensaje a la cola');
    }
    
    console.log(`✅ Mensaje enviado a ${exchange}:${routingKey}`);
    return true;
  } catch (error) {
    console.error('❌ Error publicando a cola:', error);
    throw error;
  }
}

module.exports = { publishToQueue };