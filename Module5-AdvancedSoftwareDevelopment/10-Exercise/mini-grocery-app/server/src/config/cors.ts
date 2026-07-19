/**
 * @fileoverview cors.ts
 * @module config/cors.ts
 * @description Handles logic for cors.ts
 */
import { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: env.CLIENT_URL || '*',
  credentials: !!env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
