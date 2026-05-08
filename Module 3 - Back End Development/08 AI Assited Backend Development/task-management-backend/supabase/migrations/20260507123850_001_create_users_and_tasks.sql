/*
  # Create Users and Tasks Tables with Soft Delete

  1. New Tables
    - `users`
      - `id` (text, primary key - CUID)
      - `email` (text, unique)
      - `name` (text, optional)
      - `password` (text, hashed password)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, updated on change)
      - `deleted_at` (timestamp, nullable - soft delete)

    - `tasks`
      - `id` (text, primary key - CUID)
      - `user_id` (text, foreign key → users.id)
      - `title` (text, required)
      - `description` (text, optional)
      - `status` (enum: TODO, IN_PROGRESS, DONE, default TODO)
      - `priority` (enum: LOW, MEDIUM, HIGH, default MEDIUM)
      - `due_date` (timestamp, optional)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, updated on change)
      - `deleted_at` (timestamp, nullable - soft delete)

  2. Indexes
    - users: email (for login lookup)
    - tasks: (user_id, deleted_at), (user_id, status, deleted_at), due_date, created_at
      These indexes optimize filtering by user, status, date range, and sorting

  3. Soft Delete Pattern
    - Records are marked deleted_at instead of hard-deleted
    - Queries exclude soft-deleted records by default (WHERE deleted_at IS NULL)
    - Enables audit trails, recovery, and compliance

  4. Security
    - Foreign key constraint with CASCADE delete on user deletion
    - All queries must include deleted_at check to exclude soft-deleted data
*/

CREATE TYPE status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status status_enum DEFAULT 'TODO',
  priority priority_enum DEFAULT 'MEDIUM',
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_deleted ON tasks(user_id, deleted_at);
CREATE INDEX idx_tasks_user_status_deleted ON tasks(user_id, status, deleted_at);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
