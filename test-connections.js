require("dotenv").config();
const IORedis = require("ioredis");
const amqplib = require("amqplib");

async function testConnections() {
    console.log("🧪 Probando conexiones...\n");

    // Probar Redis
    try {
        const redis = new IORedis(process.env.REDIS_URL);
        await redis.ping();
        console.log("✅ Redis: Conectado");
        await redis.set("test", "Hello Redis!");
        const value = await redis.get("test");
        console.log("✅ Redis: Test exitoso -", value);
        await redis.del("test");
        await redis.disconnect();
    } catch (error) {
        console.error("❌ Redis Error:", error.message);
    }

    // Probar RabbitMQ
    try {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        console.log("✅ RabbitMQ: Conectado");
        await channel.assertQueue("test_queue", { durable: true });
        console.log("✅ RabbitMQ: Cola de prueba creada");
        await channel.deleteQueue("test_queue");
        await channel.close();
        await connection.close();
        console.log("✅ RabbitMQ: Desconectado correctamente");
    } catch (error) {
        console.error("❌ RabbitMQ Error:", error.message);
    }

    console.log("\n✅ Pruebas completadas");
    process.exit(0);
}

testConnections();