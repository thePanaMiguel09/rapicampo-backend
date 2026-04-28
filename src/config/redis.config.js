const Redis = require('ioredis')
let redis

async function connectRedis() {
  redis = new Redis({ host: process.env.REDIS_HOST || 'redis', lazyConnect: true })
  await redis.connect()
  console.log('✅ Redis conectado')
}

const getRedis = () => redis
module.exports = { connectRedis, getRedis }
