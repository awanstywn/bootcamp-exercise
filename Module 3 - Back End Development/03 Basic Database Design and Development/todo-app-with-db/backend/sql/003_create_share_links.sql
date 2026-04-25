-- ═══════════════════════════════════════════════════════════════════════════
-- FILE: sql/003_create_share_links.sql
-- ═══════════════════════════════════════════════════════════════════════════
-- DESCRIPTION:
--   This file initializes the 'share_links' table.
--   It should be executed AFTER 002_create_todos.sql.
--
-- PURPOSE:
--   To map todos to short, shareable alphanumeric codes for public access.
--
-- HOW IT WORKS:
--   1. Creates the 'share_links' table with a foreign key to 'todos.id'.
--   2. Enforces a UNIQUE index on 'short_code' for fast 302 redirect lookup.
--   3. Uses CASCADE DELETE (if a todo is deleted, its share link is also deleted).
--
-- RELATIONS:
--   - Child table of: 'todos' (via todo_id)
--   - Referenced by: backend/src/services/share.service.ts
-- ═══════════════════════════════════════════════════════════════════════════

-- Create share_links table structure
CREATE TABLE IF NOT EXISTS share_links (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id     UUID          NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  short_code  VARCHAR(20)   NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Performance and integrity indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_share_links_code ON share_links(short_code);
CREATE INDEX IF NOT EXISTS idx_share_links_todo_id ON share_links(todo_id);

-- Database-level documentation
COMMENT ON TABLE share_links IS 'Table storing short URLs for public todo sharing';
COMMENT ON COLUMN share_links.short_code IS 'Unique 8-character alphanumeric code for the short URL';
