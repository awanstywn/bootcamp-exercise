/**
 * @module config/redis
 * @description Redis client configuration.
 * @relations Provides the core `redisClient` instance used by `server/src/services/cache.service.ts` and gracefully disconnects in `server/src/server.ts`.
 * @logic
 * - Initializes an `ioredis` singleton instance.
 * - Configures a custom retry strategy to gracefully handle temporary Redis container disconnects.
 * - Binds connection event listeners that output to the Winston logger.
 */
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

// Create a singleton Redis client
export const redisClient = new Redis(env.REDIS_URL, {
  // Required for Upstash Serverless Redis
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
  // Retry strategy: if Redis disconnects, try to reconnect
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Don't crash if Redis is unavailable at startup
  maxRetriesPerRequest: 3, 
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis Connection Error:', err);
});
