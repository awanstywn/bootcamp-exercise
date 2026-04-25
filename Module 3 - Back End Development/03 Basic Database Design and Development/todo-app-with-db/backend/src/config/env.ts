/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: config/env.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Loads and validates all environment variables from the .env file.
 *   If a mandatory variable is missing, the server fails to start IMMEDIATELY
 *   with a clear error message — preventing runtime crashes later.
 *
 * RELATIONS:
 *   - .env           → Data source read by dotenv
 *   - config/db.ts   → Uses env.DATABASE_URL for database connection
 *   - middleware/authenticate.ts → Uses env.JWT_SECRET to verify JWT tokens
 *   - services/auth.service.ts  → Uses env.BCRYPT_ROUNDS + JWT_SECRET
 *   - server.ts      → Uses env.PORT to listen and env.FRONTEND_URL for CORS
 *
 * HOW IT WORKS:
 *   1. dotenv.config() reads the .env file and injects its contents into process.env
 *   2. Validation loop ensures all critical keys are present
 *   3. Exports the `env` object with parsed data types (number, string)
 *      so other files don't need to access process.env directly
 * ═══════════════════════════════════════════════════════════════════════════
 */

import dotenv from 'dotenv';

// Step 1: Read .env file and inject into process.env
// dotenv only needs to be called ONCE at the start of the app
dotenv.config();

// Step 2: Validation — Ensure all critical variables are present
// If any are missing, throw error so the server doesn't run half-baked
const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is required in the .env file`);
  }
}

// Step 3: Export env object parsed to the correct data types
// The || operator provides a default value if the optional variable is missing
export const env = {
  PORT: parseInt(process.env.PORT!, 10),                    // HTTP server port (default: 4000)
  DATABASE_URL: process.env.DATABASE_URL!,                  // PostgreSQL connection string
  JWT_SECRET: process.env.JWT_SECRET!,                      // Secret key to sign/verify JWT
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10), // Bcrypt cost factor (10 ≈ 100ms)
  BASE_URL: process.env.BASE_URL || 'http://localhost:4000',      // Backend URL (for short links)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL (for CORS & redirects)
  NODE_ENV: process.env.NODE_ENV || 'development',                  // Deployment environment mode
};
