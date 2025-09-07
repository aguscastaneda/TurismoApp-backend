const { redis } = require('../config/redis');

const CACHE_KEYS = {
  PRODUCTS_ALL: 'products:all',
  PRODUCT: (id) => `products:${id}`,
  CURRENCY_RATES: 'currency:rates',
  CURRENCY_SYMBOLS: 'currency:symbols'
};

async function getCache(key) {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('Cache get error:', error.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 300) {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.warn('Cache set error:', error.message);
  }
}

async function delCache(pattern) {
  try {
    if (pattern.includes('*')) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(pattern);
    }
  } catch (error) {
    console.warn('Cache del error:', error.message);
  }
}

module.exports = { getCache, setCache, delCache, CACHE_KEYS };