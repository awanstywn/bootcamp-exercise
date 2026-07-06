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
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root of server
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredKeys = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'SERVER_URL'
];

const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  // eslint-disable-next-line no-console
  console.error('❌ Missing required environment variables:', missingKeys.join(', '));
  process.exit(1);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  CLIENT_URL: process.env.CLIENT_URL!,
  SERVER_URL: process.env.SERVER_URL!,
  PORT: parseInt(process.env.PORT || '3000', 10),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
};
