-- ============================================================
-- INIT.SQL — Chatbot Database Schema
-- Run automatically by the PostgreSQL container on startup
-- ============================================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generator extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a separate schema for n8n to avoid conflict with application tables
CREATE SCHEMA IF NOT EXISTS n8n;

-- ============================================================
-- TABLE: agent_personas
-- Stores different "characters" or "skills" of the AI agent
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_personas (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    system_prompt TEXT      NOT NULL,
    is_active   BOOLEAN     DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default persona (active immediately)
INSERT INTO agent_personas (name, description, system_prompt, is_active) VALUES (
    'General Assistant',
    'Versatile AI assistant for general questions',
    'You are a helpful, friendly AI assistant. Answer questions clearly and concisely. If you have relevant context from the knowledge base, use it to provide more accurate answers. Always respond in the same language as the user.',
    TRUE
);

-- ============================================================
-- TABLE: conversations
-- One conversation = one chat session (Telegram or Web)
-- Unique session_id per user per platform
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(255) NOT NULL UNIQUE,
    source          VARCHAR(50)  NOT NULL DEFAULT 'web',  -- 'web' | 'telegram'
    telegram_chat_id BIGINT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: messages
-- Chat history per conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT        NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying chat history (frequently filtered by conversation + ordered by time)
CREATE INDEX idx_messages_conv_time ON messages(conversation_id, created_at DESC);

-- ============================================================
-- TABLE: documents
-- File metadata uploaded as knowledge base for RAG
-- file_hash is used for duplicate detection
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_type   VARCHAR(50),
    file_size   BIGINT,
    file_hash   VARCHAR(64),        -- SHA-256 hash for duplicate detection
    chunk_count INT         DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index to check for duplicates based on file hash
CREATE INDEX idx_documents_hash ON documents(file_hash) WHERE file_hash IS NOT NULL;

-- ============================================================
-- TABLE: document_chunks
-- Document contents split into chunks and embedded for RAG
-- embedding = 1536-dimensional vector representation (text-embedding-3-small)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    embedding   vector(1536),   -- pgvector: 1536 dimensions for text-embedding-3-small
    chunk_index INT         NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector search (cosine distance)
-- Note: Create this index after there is sufficient data (>1000 rows)
-- CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_personas_updated_at
    BEFORE UPDATE ON agent_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: Activate persona atomically (prevents race conditions)
-- Deactivates all personas first, then activates the chosen one within a single transaction
-- ============================================================
CREATE OR REPLACE FUNCTION activate_persona(target_id UUID)
RETURNS SETOF agent_personas AS $$
BEGIN
    UPDATE agent_personas SET is_active = FALSE WHERE is_active = TRUE;
    UPDATE agent_personas SET is_active = TRUE WHERE id = target_id;
    RETURN QUERY SELECT * FROM agent_personas WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;
