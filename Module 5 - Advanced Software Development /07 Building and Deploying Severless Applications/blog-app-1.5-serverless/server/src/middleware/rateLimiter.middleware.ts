/**
 * @fileoverview Rate Limiter Middleware
 * @objective Protect API endpoints from abuse by limiting the number of requests per IP address.
 * @risk Without rate limiting, the API is vulnerable to brute-force and DDoS attacks.
 * @relations Used in `app.ts` (globalLimiter) and `upload.routes.ts` (authLimiter).
 * @logic
 * - Uses Redis-backed storage when available for distributed rate limiting.
 * - Falls back to in-memory storage when Redis is not configured (suitable for serverless).
 */
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';

// Helper to create a RedisStore only if Redis is available
function createStore(prefix: string) {
  if (!redisClient) return undefined; // Falls back to express-rate-limit's built-in MemoryStore
  return new RedisStore({
    prefix,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => redisClient!.call(args[0], ...args.slice(1)) as any,
  });
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createStore('rl:global:'),
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Start blocking after 10 requests
  message: {
    status: 'error',
    message: 'Too many attempts from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:auth:'),
});
