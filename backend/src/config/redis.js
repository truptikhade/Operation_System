const Redis = require('ioredis');
const logger = require('./logger');

let redisClient;

async function connectRedis() {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  redisClient.on('connect', () => logger.info('Redis connected successfully'));
  redisClient.on('error', (err) => logger.error('Redis error:', err.message));

  return redisClient;
}

function getRedis() {
  if (!redisClient) throw new Error('Redis not initialized');
  return redisClient;
}

// Key helpers
const KEYS = {
  activeOps: () => 'polops:active_operations',
  opStatus: (id) => `polops:op:${id}:status`,
  officerLocation: (id) => `polops:officer:${id}:location`,
  session: (token) => `polops:session:${token}`,
  alertChannel: () => 'polops:alerts',
};

module.exports = { connectRedis, getRedis, KEYS };
