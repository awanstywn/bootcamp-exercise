-- ═══════════════════════════════════════════════════════════════════════════
-- FILE: sql/001_create_users.sql
-- ═══════════════════════════════════════════════════════════════════════════
-- DESCRIPTION:
--   This file initializes the 'users' table in the PostgreSQL database.
--   It is the first file that must be executed in the schema sequence.
--
-- PURPOSE:
--   To store user account information including their name, email, and
--   securely hashed password.
--
-- HOW IT WORKS:
--   1. Enables the 'pgcrypto' extension to allow generating random UUIDs.
--   2. Creates the 'users' table with constraints (NOT NULL, UNIQUE).
--   3. Adds a unique index on the 'email' column to ensure no duplicates
--      and to optimize performance for login queries.
--
-- RELATIONS:
--   - Parent table for: 'todos' (via user_id)
--   - Parent table for: 'share_links' (indirectly via todos)
--   - Referenced by: backend/src/services/auth.service.ts
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable extension for random UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table structure
CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Unique index to optimize login lookup by email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Database-level documentation
COMMENT ON TABLE users IS 'User account table for the Todo List application';
COMMENT ON COLUMN users.id IS 'Auto-generated random UUID, primary key';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password. NEVER store plain text passwords.';
