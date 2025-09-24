const IORedis = require('ioredis');

let redis = null;

// Solo inicializar Redis si hay URL configurada
if (process.env.REDIS_URL) {
  redis = new IORedis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
    redis = null; // Desactivar Redis en caso de error
  });

  redis.on('connect', () => {
    console.log('✅ Redis conectado');
  });
} else {
  console.log('⚠️ Redis no configurado, funcionando sin cache');
}

module.exports = { redis };