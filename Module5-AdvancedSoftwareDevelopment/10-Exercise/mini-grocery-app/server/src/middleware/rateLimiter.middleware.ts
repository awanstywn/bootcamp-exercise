/**
 * @fileoverview rateLimiter.middleware.ts
 * @module middleware/rateLimiter.middleware.ts
 * @description Express middleware for rateLimiter.
 */
import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
