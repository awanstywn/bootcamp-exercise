/**
 * FILE: src/config/db.ts
 * 
 * DESCRIPTION:
 * This file configures and exports the PostgreSQL database connection pool.
 * It uses the 'pg' library to manage multiple reusable database connections,
 * which improves performance by avoiding the overhead of establishing a new
 * connection for every API request.
 * 
 * INTERACTION:
 * - Reads environment variables from the `.env` file (via `dotenv`).
 * - Exported `pool` is imported and used by `src/controllers/todo.controller.ts` 
 *   to execute SQL queries against the Supabase database.
 * - Also used by `src/setup-db.ts` to execute the initial table creation query.
 */

import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a connection pool to Supabase PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST, // Supabase PostgreSQL host
  port: Number(process.env.DB_PORT), // PostgreSQL port (default 5432)
  database: process.env.DB_NAME, // Database name
  user: process.env.DB_USER, // Supabase database user
  password: process.env.DB_PASSWORD, // Supabase database password
  ssl: {
    rejectUnauthorized: false, // Required for Supabase SSL connections
  },
});

export default pool;
