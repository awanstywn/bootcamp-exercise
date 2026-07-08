/**
 * @module services/cache.service
 * @description Provides a high-level abstraction over Redis for caching application data.
 * @relations Utilizes `config/redis.ts`. Used by other business services (like `content.service.ts`) to cache database queries.
 * @logic
 * - Implements a "fail-open" pattern. If Redis crashes, errors are logged to Winston and it gracefully returns `null`, forcing a database query rather than crashing the app.
 * - Supports setting TTLs, deleting specific keys, and bulk invalidation using patterns (`delByPattern`).
 */
import { redisClient } from '../config/redis.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class CacheService {
  /**
   * Get data from cache. Fails open on error.
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache GET Error for key ${key}:`, error);
      return null; // Fail-open: if cache fails, pretend it's a cache miss
    }
  }

  /**
   * Save data to cache
   */
  static async set<T>(key: string, data: T, ttlSeconds: number = env.CACHE_TTL): Promise<void> {
    try {
      const stringData = JSON.stringify(data);
      await redisClient.setex(key, ttlSeconds, stringData);
    } catch (error) {
      logger.error(`Cache SET Error for key ${key}:`, error);
    }
  }

  /**
   * Delete a specific key
   */
  static async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache DEL Error for key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern (e.g. "posts:*")
   */
  static async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delByPattern Error for pattern ${pattern}:`, error);
    }
  }
}
