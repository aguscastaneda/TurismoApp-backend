const IORedis = require('ioredis');

const redis = new IORedis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis conectado');
});

module.exports = { redis };