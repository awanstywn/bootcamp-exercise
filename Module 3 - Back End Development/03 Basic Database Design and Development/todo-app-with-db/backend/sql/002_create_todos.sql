-- ═══════════════════════════════════════════════════════════════════════════
-- FILE: sql/002_create_todos.sql
-- ═══════════════════════════════════════════════════════════════════════════
-- DESCRIPTION:
--   This file initializes the 'todos' table.
--   It should be executed AFTER 001_create_users.sql.
--
-- PURPOSE:
--   To store tasks/todos created by users. Each todo is linked to a specific user.
--
-- HOW IT WORKS:
--   1. Creates the 'todos' table with a UUID primary key.
--   2. Sets up a Foreign Key to 'users.id' with CASCADE DELETE (if a user is
--      deleted, their todos are automatically deleted).
--   3. Includes a 'manual_index' column to maintain custom drag-and-drop order.
--   4. Adds composite indexes to optimize filtering and sorting.
--
-- RELATIONS:
--   - Child table of: 'users' (via user_id)
--   - Parent table for: 'share_links' (via todo_id)
--   - Referenced by: backend/src/services/todo.service.ts
-- ═══════════════════════════════════════════════════════════════════════════

-- Create todos table structure
CREATE TABLE IF NOT EXISTS todos (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text          TEXT          NOT NULL,
  completed     BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  manual_index  INTEGER       NOT NULL DEFAULT 0
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id    ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_user_manual ON todos(user_id, manual_index);

-- Database-level documentation
COMMENT ON TABLE todos IS 'Table for storing tasks/todos per user';
COMMENT ON COLUMN todos.user_id IS 'Foreign key to users.id; CASCADE DELETE enabled';
COMMENT ON COLUMN todos.manual_index IS 'Position for drag-and-drop sorting (0-based)';
