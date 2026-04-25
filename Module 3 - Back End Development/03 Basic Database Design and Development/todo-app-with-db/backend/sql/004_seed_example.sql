-- ═══════════════════════════════════════════════════════════════════════════
-- FILE: sql/004_seed_example.sql
-- ═══════════════════════════════════════════════════════════════════════════
-- DESCRIPTION:
--   Seed data for development and testing.
--   Run this file ONLY in development environments.
--
-- PURPOSE:
--   To provide a default user and sample todos so developers can test the
--   application immediately without manual registration.
--
-- HOW IT WORKS:
--   1. Inserts a test user with a pre-hashed bcrypt password ("Test@1234").
--   2. Performs a subquery to find the ID of that user by email.
--   3. Inserts sample todos linked to that user ID.
--
-- RELATIONS:
--   - Populates tables: 'users', 'todos'
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert a test user 
-- Password: "Test@1234" (already hashed with bcrypt)
INSERT INTO users (name, email, password_hash) VALUES
  ('Test User', 'test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG')
ON CONFLICT (email) DO NOTHING;

-- Insert sample todos for the test user
-- We use a SELECT subquery to ensure we link to the correct user ID
INSERT INTO todos (user_id, text, completed, manual_index) 
SELECT id, 'Learn Express.js & PostgreSQL', false, 0 
FROM users WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO todos (user_id, text, completed, manual_index)
SELECT id, 'Build an Awesome Todo App', true, 1 
FROM users WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;
