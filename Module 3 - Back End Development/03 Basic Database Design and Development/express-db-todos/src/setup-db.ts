/**
 * FILE: src/setup-db.ts
 * 
 * DESCRIPTION:
 * This is a utility script used to initialize the database schema.
 * It connects to the Supabase PostgreSQL database and creates the `todos` 
 * table if it does not already exist. 
 * 
 * INTERACTION:
 * - Imports the DB connection pool from `src/config/db.ts`.
 * - Executed manually via the `npm run setup-db` script. It is NOT run
 *   automatically when the server starts.
 */

import pool from "./config/db.js";

// One-time script to create the todos table in Supabase
// Run with: npm run setup-db
const createTable = async (): Promise<void> => {
  try {
    console.log("Connecting to Supabase PostgreSQL...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id         SERIAL PRIMARY KEY,
        title      VARCHAR(255) NOT NULL,
        completed  BOOLEAN DEFAULT false,
        author     VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Table "todos" created successfully!');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error creating table:", message);
  } finally {
    // We must end the pool connection otherwise the script will hang
    await pool.end();
    process.exit(0);
  }
};

createTable();
