/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: config/db.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Creates and exports a connection pool to the PostgreSQL database.
 *   Pool = a collection of recycled connections (no need to create a new connection
 *   every time there is a query → more efficient for production).
 *
 * RELATIONS:
 *   - config/env.ts       → Provides DATABASE_URL and NODE_ENV
 *   - services/*.ts       → ALL service files import { pool } for SQL queries
 *   - routes/todo.routes.ts → Also imports pool for the shared (public) endpoint
 *
 * HOW IT WORKS:
 *   1. Creates pg.Pool using the connection string from .env
 *   2. The pool manages max 10 active connections and closes idle connections after 30 seconds
 *   3. Event listeners for 'connect' and 'error' for console monitoring
 *
 * ANALOGY:
 *   A pool is like a taxi stand at an airport — there are several taxis (connections) ready.
 *   When there's a passenger (query), an empty taxi is immediately used.
 *   Once done, the taxi returns to the stand, rather than being destroyed.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Pool } from 'pg';
import { env } from './env.js';

// Create database connection pool
// connectionString: Full URL to the database (user:password@host:port/dbname)
// max: maximum number of concurrent connections in the pool
// idleTimeoutMillis: how long an idle connection waits before disconnecting
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,                           // Max 10 parallel connections
  idleTimeoutMillis: 30000,          // Close connections idle for > 30 seconds
});

// Event: called every time a new connection is successfully established
pool.on('connect', () => {
  console.log('✅ Database connected');
});

// Event: called if there is an error on the pool (not a per-query error)
// Example: database crash, network timeout, etc.
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});
