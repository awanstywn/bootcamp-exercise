/**
 * @fileoverview Environment Variables Config and Validation
 * @objective Load, parse, and strictly validate environment variables to guarantee they are present and correctly typed before the app boots.
 * @risk If missing environment variables are not caught early, they can cause unpredictable crashes or silent failures in production.
 * @relations Used globally across the server to access environment variables. Depends on `zod` and `dotenv`.
 * @logic
 * - Loads `.env` from the project root using `dotenv`.
 * - Defines a strict schema using Zod for all required and optional environment keys (e.g., Database URLs, JWT secrets, Cloudinary).
 * - Attempts to parse `process.env`. If it fails, it logs the missing/invalid fields and immediately exits the process with code 1.
 * - Exports the safely typed `env` object.
 */
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root of server
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url(),
  SERVER_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  CACHE_TTL: z.coerce.number().default(300),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
