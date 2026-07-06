# 🤖 AI Chatbot — Full Implementation Plan

> **Stack**: n8n (Docker) · PostgreSQL + pgvector · OpenRouter · OpenAI Embeddings · Telegram Bot · React + TypeScript + Zustand + Vite

---

## 📋 Daftar Isi

1. [System Architecture](#1-system-architecture)
2. [Engineering Decisions](#2-engineering-decisions)
3. [Project Structure](#3-project-structure)
4. [Phase 0 — Prerequisites & API Keys](#4-phase-0--prerequisites--api-keys)
5. [Phase 1 — Infrastructure Setup](#5-phase-1--infrastructure-setup)
6. [Phase 2 — Database Schema](#6-phase-2--database-schema)
7. [Phase 3 — n8n Setup & Credentials](#7-phase-3--n8n-setup--credentials)
8. [Phase 4 — Telegram Bot Setup](#8-phase-4--telegram-bot-setup)
9. [Phase 5 — n8n Workflows](#9-phase-5--n8n-workflows)
10. [Phase 6 — Frontend React App](#10-phase-6--frontend-react-app)
11. [Phase 7 — Integration Testing](#11-phase-7--integration-testing)
12. [Appendix — Troubleshooting](#12-appendix--troubleshooting)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
│                                                                 │
│   📱 Telegram App              🌐 React Web App (localhost:5173) │
│        │ polling                       │ HTTP via Vite Proxy    │
└────────┼───────────────────────────────┼─────────────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  n8n Orchestrator (localhost:5678)              │
│                                                                 │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ Workflow 1       │  │ Workflow 2     │  │ Workflow 3       │  │
│  │ Telegram Chat   │  │ Web Chat API  │  │ Persona CRUD    │  │
│  │   + RAG          │  │   + RAG        │  │ API             │  │
│  └─────────────────┘  └────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌────────────────┐                        │
│  │ Workflow 4       │  │ Workflow 5     │                        │
│  │ Doc Upload      │  │ Doc List &    │                        │
│  │ & Embedding     │  │ Delete         │                        │
│  └─────────────────┘  └────────────────┘                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
       ┌───────────────────────┼─────────────────────┐
       ▼                       ▼                     ▼
┌────────────────┐   ┌──────────────────────┐  ┌──────────────┐
│  OpenRouter    │   │  PostgreSQL + pgvec  │  │  OpenAI API  │
│  (Chat LLM)    │   │  (localhost:5432)    │  │ (Embeddings) │
│  gpt-4o-mini   │   │                      │  │ text-emb-3-s │
└────────────────┘   │  ┌────────────────┐  │  └──────────────┘
                     │  │ agent_personas │  │
                     │  │ conversations  │  │
                     │  │ messages       │  │
                     │  │ documents      │  │
                     │  │ document_chunks│  │
                     │  │ (vector store) │  │
                     │  └────────────────┘  │
                     └──────────────────────┘
```

### Alur Data (Data Flow)

```
1. CHAT FLOW (Telegram atau Web):
   User Message
     → n8n Trigger
     → Ambil active persona (system prompt) dari DB
     → Ambil riwayat 10 pesan terakhir dari DB
     → Generate embedding dari user message (OpenAI)
     → Vector similarity search di document_chunks (pgvector)
     → Gabungkan: system_prompt + context + history + user message
     → Kirim ke OpenRouter LLM
     → Simpan user message + AI response ke DB
     → Kirim balasan ke user

2. DOCUMENT UPLOAD FLOW:
   File (PDF/TXT) dari React
     → n8n Webhook
     → Ekstrak teks dari file
     → Simpan metadata ke documents table (dapat document_id)
     → Pecah teks menjadi chunks (500 karakter, overlap 100)
     → Loop per chunk:
         → Generate embedding (OpenAI)
         → INSERT ke document_chunks dengan vector embedding
     → Update chunk_count di documents table
     → Respons sukses
```

---

## 2. Engineering Decisions

### 2.1 Kenapa Docker Compose? (bukan install manual)

Masalah jika install manual di MacBook:
- pgvector butuh kompilasi dari source code (ribet)
- n8n + PostgreSQL + konfigurasi = banyak langkah manual
- Susah di-reset kalau ada masalah

Dengan Docker Compose:
- Satu perintah `docker compose up -d` → semua jalan
- pgvector sudah termasuk di image `pgvector/pgvector:pg16`
- Mudah dihapus: `docker compose down -v`
- Reproducible di semua mesin

### 2.2 Kenapa pgvector bukan Pinecone/Chroma?

RAG membutuhkan vector database untuk semantic search. Pilihannya:

| Opsi | Pro | Con |
|------|-----|-----|
| **pgvector** ✅ | Sudah pakai PostgreSQL, satu service | - |
| Pinecone | Managed, mudah | Cloud, butuh account, bisa berbayar |
| ChromaDB | Open source | Butuh service baru + Python |
| Qdrant | Performa tinggi | Butuh service baru |

**Keputusan**: pgvector karena kita sudah punya PostgreSQL. Menambah extension `CREATE EXTENSION vector` sudah cukup. Tidak perlu service tambahan.

### 2.3 Kenapa dua API provider (OpenRouter + OpenAI)?

- **OpenRouter**: untuk chat LLM. Support banyak model dengan satu API key, bisa switch model kapan saja.
- **OpenAI**: untuk embeddings. OpenRouter **tidak** mendukung endpoint `/v1/embeddings`. Model `text-embedding-3-small` harganya sangat murah ($0.02 per 1 juta token). Untuk proyek bootcamp, biasanya < $0.10.

### 2.4 Kenapa n8n sebagai backend?

n8n adalah low-code workflow automation. Untuk bootcamp project:
- **Tidak perlu nulis Express.js backend** untuk Telegram, cukup gunakan node bawaan
- Webhook node otomatis jadi REST API endpoint
- Visual debugger → lihat data yang mengalir antar node
- Bisa ganti logika tanpa deploy ulang
- Telegram polling ditangani n8n secara internal

Kekurangan untuk production: performa tidak setara Express murni. Untuk bootcamp: sangat memadai.

### 2.5 Kenapa Zustand bukan Redux?

Untuk scope aplikasi ini (3 halaman, state tidak super kompleks):
- Zustand = setup minimal, boilerplate sedikit
- Redux = overhead yang tidak perlu untuk project ini
- Zustand bisa dipelajari dalam 30 menit

### 2.6 Kenapa Vite Proxy bukan mengaktifkan CORS di n8n?

React frontend berjalan di `localhost:5173`, n8n di `localhost:5678`. Browser akan memblokir request karena **CORS policy** (different port = different origin).

Solusi 1: Konfigurasi CORS header di setiap Webhook node n8n (ribet, harus diset di tiap workflow)
Solusi 2 ✅: Vite dev server proxy — request dari React ke `/api/*` otomatis di-forward ke `localhost:5678/*`. Browser tidak tahu ada beda origin.

### 2.7 Database Schema Design

```
agent_personas  ──< conversations >── messages
                        ↑
                    (session_id)

documents ──< document_chunks
              (content + embedding vector)
```

`conversations` diidentifikasi dengan `session_id`:
- Telegram: `telegram_{chat_id}`
- Web: UUID yang disimpan di localStorage browser

### 2.8 Error Handling Philosophy

Setiap n8n workflow **wajib** memiliki error handling:
- **Error Trigger node**: Tangkap error dari workflow manapun, log ke execution history.
- **Telegram workflows**: Kirim pesan error ke user ("Maaf, ada kendala teknis. Coba lagi dalam beberapa saat.").
- **Web API workflows**: Return HTTP 500 dengan JSON `{ "error": "...", "code": 500 }`.
- **Code nodes**: Selalu wrap akses `$json` dengan null checks untuk mencegah crash.

### 2.9 Input Validation Strategy

Setiap webhook endpoint harus memvalidasi input **sebelum** memproses:
- Cek required fields (message, name, file, dll)
- Cek tipe data dan panjang string
- Return HTTP 400 dengan pesan error spesifik jika validasi gagal
- Validasi dilakukan di **Code node** tepat setelah Webhook/Trigger node

### 2.10 Docker Version Pinning

Semua Docker image di-pin ke versi spesifik untuk reproducibility:
- `pgvector/pgvector:pg16` — sudah spesifik ke PG16
- `n8nio/n8n:1.94.1` — pin ke versi stabil, **jangan pakai `latest`** karena n8n sering breaking change

Untuk update versi, test dulu di environment terpisah sebelum update di project.

---

## 3. Project Structure

```
chatbot-project/
├── docker-compose.yml          # Infrastruktur: n8n + PostgreSQL
├── .env                        # Variabel lingkungan (JANGAN commit ke git!)
├── .gitignore
├── database/
│   └── init.sql                # Schema PostgreSQL + pgvector setup
├── uploads/                    # Folder mount untuk file upload sementara
└── chatbot-ui/                 # React Frontend (dibuat di Phase 6)
    ├── src/
    │   ├── api/
    │   │   └── client.ts       # Axios instance + semua API calls
    │   ├── components/
    │   │   ├── Chat/
    │   │   ├── Personas/
    │   │   └── Documents/
    │   ├── stores/
    │   │   ├── chatStore.ts    # Zustand: state chat
    │   │   ├── personaStore.ts # Zustand: state personas
    │   │   └── documentStore.ts
    │   ├── pages/
    │   │   ├── ChatPage.tsx
    │   │   ├── PersonasPage.tsx
    │   │   └── DocumentsPage.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── vite.config.ts          # Termasuk proxy config
    └── package.json
```

---

## 4. Phase 0 — Prerequisites & API Keys

### 4.1 Install Docker Desktop

Docker Desktop adalah aplikasi yang menjalankan Docker di MacBook.

1. Buka browser → https://www.docker.com/products/docker-desktop/
2. Download versi **Mac with Apple Silicon** (jika MacBook M1/M2/M3/M4) atau **Mac with Intel Chip**
3. Install `.dmg` file, drag Docker ke Applications
4. Buka Docker Desktop, tunggu hingga status bar menunjukkan "Docker Desktop is running"

Verifikasi:
```bash
docker --version
# Docker version 24.x.x, build xxxxx

docker compose version
# Docker Compose version v2.x.x
```

### 4.2 Dapatkan API Keys

**A. OpenRouter** (untuk Chat LLM)
1. Buka https://openrouter.ai/
2. Sign up / Log in
3. Masuk ke **Settings → API Keys**
4. Klik **Create Key**, beri nama "Chatbot Bootcamp"
5. Copy key yang diawali `sk-or-v1-...`
6. Di **Credits** tab, top up minimal $5 (cukup untuk banyak percobaan)

**B. OpenAI** (untuk Embeddings)
1. Buka https://platform.openai.com/
2. Sign up / Log in
3. Masuk ke **API Keys** (menu kiri)
4. Klik **Create new secret key**
5. Copy key yang diawali `sk-...`
6. Di **Billing**, tambahkan payment method dan beli $5 credit
   > 💡 Tip: Model `text-embedding-3-small` sangat murah. $5 cukup untuk ribuan dokumen.

**C. Telegram Bot Token** (dibuat di Phase 4)

### 4.3 Cek Node.js dan npm

```bash
node --version   # harus >= 18.0.0
npm --version    # harus terinstall (bawaan Node.js)
```

---

## 5. Phase 1 — Infrastructure Setup

### 5.1 Buat Direktori Project

```bash
# Buat folder project
mkdir chatbot-project
cd chatbot-project

# Buat subfolder yang dibutuhkan
mkdir -p database uploads
```

### 5.2 Buat File `.env`

```bash
touch .env
```

Isi `.env` dengan:

> ⚠️ **PENTING**: Jangan gunakan password default di bawah! Generate password unik untuk setiap field.

```env
# ============================================
# PostgreSQL
# ============================================
POSTGRES_USER=chatbot_user
# Generate: openssl rand -base64 24
POSTGRES_PASSWORD=CHANGE_ME_generate_strong_password
POSTGRES_DB=chatbot_db

# ============================================
# n8n
# ============================================
N8N_BASIC_AUTH_USER=admin
# Generate: openssl rand -base64 24
N8N_BASIC_AUTH_PASSWORD=CHANGE_ME_generate_strong_password
# Generate: openssl rand -hex 32
N8N_ENCRYPTION_KEY=CHANGE_ME_generate_hex_string

# ============================================
# API Keys (untuk referensi, diisi manual ke n8n credentials)
# ============================================
OPENROUTER_API_KEY=sk-or-v1-isi-dengan-key-anda
OPENAI_API_KEY=sk-isi-dengan-key-anda
```

> ⚠️ **Wajib**: Generate semua password/key sebelum mulai:
> ```bash
> # Generate password PostgreSQL & n8n
> openssl rand -base64 24
> 
> # Generate encryption key n8n
> openssl rand -hex 32
> ```
> Copy hasilnya ke `.env`. **Jangan pernah commit file `.env` ke git.**

Buat `.env.example` (template tanpa nilai sensitif, ini yang di-commit ke git):

```bash
cat > .env.example << 'EOF'
POSTGRES_USER=chatbot_user
POSTGRES_PASSWORD=
POSTGRES_DB=chatbot_db
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=
N8N_ENCRYPTION_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
EOF
```

Buat `.gitignore`:

```bash
cat > .gitignore << 'EOF'
.env
uploads/
n8n_data/
postgres_data/
node_modules/
EOF
```

### 5.3 Buat `docker-compose.yml`

```bash
touch docker-compose.yml
```

Isi dengan:

```yaml
version: '3.8'

services:
  # ─────────────────────────────────────────
  # PostgreSQL dengan ekstensi pgvector
  # Image khusus yang sudah include pgvector
  # ─────────────────────────────────────────
  postgres:
    image: pgvector/pgvector:pg16
    container_name: chatbot_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      # Persistent data storage
      - postgres_data:/var/lib/postgresql/data
      # Script init otomatis dijalankan saat container pertama kali dibuat
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  # ─────────────────────────────────────────
  # n8n — Workflow Automation (backend kita)
  # ─────────────────────────────────────────
  n8n:
    image: n8nio/n8n:1.94.1    # Pin versi! Jangan pakai 'latest'
    container_name: chatbot_n8n
    restart: unless-stopped
    environment:
      # Auth untuk akses n8n dashboard
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}

      # Koneksi n8n ke PostgreSQL (untuk menyimpan data internal n8n)
      # n8n menggunakan schema "n8n" → tidak bentrok dengan table app kita
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - DB_POSTGRESDB_SCHEMA=n8n

      # Network config
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      # WEBHOOK_URL adalah base URL yang dipakai n8n untuk generate webhook links
      # Karena localhost, Telegram tidak bisa reach → otomatis pakai polling mode
      - WEBHOOK_URL=http://localhost:5678/

      # Timezone Indonesia
      - GENERIC_TIMEZONE=Asia/Jakarta

      # Key untuk enkripsi credentials di n8n
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./uploads:/home/node/.n8n/uploads
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  n8n_data:
```

### 5.4 Jalankan Infrastructure

```bash
# Dari folder chatbot-project/
docker compose up -d
```

Tunggu 30-60 detik. Cek status:

```bash
docker compose ps
```

Output yang diharapkan:
```
NAME                STATUS              PORTS
chatbot_n8n         Up About a minute   0.0.0.0:5678->5678/tcp
chatbot_postgres    Up About a minute   0.0.0.0:5432->5432/tcp
```

Cek log jika ada masalah:
```bash
docker compose logs n8n --tail=20
docker compose logs postgres --tail=20
```

---

## 6. Phase 2 — Database Schema

### 6.1 Buat `database/init.sql`

File ini dijalankan **otomatis** saat PostgreSQL container pertama kali dibuat.

```bash
touch database/init.sql
```

Isi dengan:

```sql
-- ============================================================
-- INIT.SQL — Chatbot Database Schema
-- Dijalankan otomatis oleh PostgreSQL container saat startup
-- ============================================================

-- Aktifkan ekstensi pgvector untuk vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Aktifkan UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat schema terpisah untuk n8n (agar tidak bentrok dengan table app)
CREATE SCHEMA IF NOT EXISTS n8n;

-- ============================================================
-- TABLE: agent_personas
-- Menyimpan berbagai "karakter" atau "skill" AI agent
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

-- Persona default (langsung aktif)
INSERT INTO agent_personas (name, description, system_prompt, is_active) VALUES (
    'General Assistant',
    'Asisten AI serbaguna untuk pertanyaan umum',
    'You are a helpful, friendly AI assistant. Answer questions clearly and concisely. If you have relevant context from the knowledge base, use it to provide more accurate answers. Always respond in the same language as the user.',
    TRUE
);

-- ============================================================
-- TABLE: conversations
-- Satu conversation = satu sesi chat (Telegram atau Web)
-- session_id unik per pengguna per platform
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
-- Riwayat chat per conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT        NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query riwayat chat (sering diquery berdasarkan conversation + waktu)
CREATE INDEX idx_messages_conv_time ON messages(conversation_id, created_at DESC);

-- ============================================================
-- TABLE: documents
-- Metadata file yang diupload sebagai knowledge base
-- file_hash digunakan untuk deteksi duplikat
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_type   VARCHAR(50),
    file_size   BIGINT,
    file_hash   VARCHAR(64),        -- SHA-256 hash untuk deteksi duplikat
    chunk_count INT         DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk cek duplikat berdasarkan hash
CREATE INDEX idx_documents_hash ON documents(file_hash) WHERE file_hash IS NOT NULL;

-- ============================================================
-- TABLE: document_chunks
-- Isi dokumen yang sudah dipecah + di-embed untuk RAG
-- embedding = representasi vektor 1536 dimensi (text-embedding-3-small)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    embedding   vector(1536),   -- pgvector: 1536 dimensi untuk text-embedding-3-small
    chunk_index INT         NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian vektor (cosine distance)
-- Catatan: Buat index ini setelah data sudah cukup banyak (>1000 rows)
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
-- FUNCTION: Activate persona secara atomic (mencegah race condition)
-- Nonaktifkan semua persona lalu aktifkan yang dipilih, dalam 1 transaksi
-- ============================================================
CREATE OR REPLACE FUNCTION activate_persona(target_id UUID)
RETURNS SETOF agent_personas AS $$
BEGIN
    UPDATE agent_personas SET is_active = FALSE WHERE is_active = TRUE;
    UPDATE agent_personas SET is_active = TRUE WHERE id = target_id;
    RETURN QUERY SELECT * FROM agent_personas WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Verifikasi Database

Karena init.sql sudah dijalankan otomatis saat container start, verifikasi dengan:

```bash
# Masuk ke PostgreSQL container
docker exec -it chatbot_postgres psql -U postgres -d chatbot_db

# Cek extensions
\dx

# Cek tables
\dt

# Cek isi agent_personas (harusnya ada 1 row)
SELECT id, name, is_active FROM agent_personas;

# Keluar
\q
```

---

## 7. Phase 3 — n8n Setup & Credentials

### 7.1 Akses n8n Dashboard

1. Buka browser → http://localhost:5678
2. Login dengan:
   - Username: `admin` (sesuai `.env`)
   - Password: `admin123456`
3. Akan muncul n8n canvas (area kerja visual)

### 7.2 Setup Credentials

Credentials adalah tempat n8n menyimpan API keys secara aman (terenkripsi). Kita perlu buat 4 credentials.

**Cara buka credential manager**: Klik nama username (pojok kiri bawah) → **Settings** → **Credentials** → tombol **Add credential**

---

#### Credential 1: PostgreSQL

- Cari: `PostgreSQL`
- Isi:
  ```
  Host      : postgres        ← nama service di docker-compose
  Database  : chatbot_db
  User      : postgres        ← sesuai dengan POSTGRES_USER di .env
  Password  : [Password Anda] ← sesuai dengan POSTGRES_PASSWORD di .env (misal: XUgOZQQwXCNRYsGAiqYKn8VJ5N/QyI72)
  Port      : 5432            ← port internal di dalam network Docker
  ```
- Klik **Save** → Klik **Test connection** (harus muncul "Connection tested successfully")
- Beri nama: `Chatbot PostgreSQL`

---

#### Credential 2: OpenAI (untuk Embeddings)

- Cari: `OpenAI`
- Isi:
  ```
  API Key   : sk-xxxxx   ← OpenAI API key Anda
  ```
- **Jangan ubah Base URL** (biarkan default: https://api.openai.com/v1)
- Beri nama: `OpenAI Embeddings`

---

#### Credential 3: OpenRouter (sebagai OpenAI-compatible, untuk Chat LLM)

> **Engineering Decision**: OpenRouter kompatibel dengan OpenAI API. Kita pakai credential type "OpenAI" tapi ganti Base URL ke OpenRouter. Dengan cara ini, semua n8n node yang support OpenAI bisa dipakai dengan OpenRouter.

- Cari: `OpenAI`
- Isi:
  ```
  API Key   : sk-or-v1-xxxxx   ← OpenRouter API key Anda
  Base URL  : https://openrouter.ai/api/v1
  ```
- Beri nama: `OpenRouter Chat`

---

#### Credential 4: Telegram (dibuat setelah Phase 4)

Lanjutkan ke Phase 4 untuk mendapatkan Bot Token, lalu kembali ke sini.

- Cari: `Telegram`
- Isi:
  ```
  Access Token : token_dari_botfather
  ```
- Beri nama: `Telegram Bot`

---

## 8. Phase 4 — Telegram Bot Setup

### 8.1 Buat Bot via BotFather

1. Buka Telegram, cari `@BotFather`
2. Kirim `/newbot`
3. BotFather akan tanya nama bot → ketik: `Chatbot Bootcamp` (atau nama lain)
4. BotFather tanya username bot → harus diakhiri "bot" → contoh: `chatboot_ku_bot`
5. BotFather akan kirim **Bot Token** format: `123456789:ABCdefGHIjklMNOpqrSTUVwxyz`
6. **Simpan token ini** → isi ke Credential 4 di n8n

### 8.2 Konfigurasi Bot (Opsional)

Masih di BotFather:
```
/setdescription → tambahkan deskripsi bot
/setuserpic → upload foto profil
```

> 💡 **Catatan**: Karena n8n berjalan di localhost (tidak punya public URL), Telegram akan menggunakan **polling mode** secara otomatis. n8n akan "minta" update dari Telegram setiap beberapa detik. Ini cukup untuk development.

---

## 9. Phase 5 — n8n Workflows

### Cara Membuat Workflow di n8n

1. Klik tombol **+** atau **New Workflow** di kiri atas
2. Rename workflow: klik nama "My workflow" di tengah atas
3. Klik **+** (plus) di canvas untuk tambah node
4. Klik node untuk konfigurasi
5. Hubungkan node: drag dari titik kanan node → ke titik kiri node berikutnya
6. Selesai → klik **Save** (Cmd+S)
7. Aktifkan workflow: toggle **Inactive** → **Active** di pojok kanan atas

> **Penting**: Workflow harus **Active** agar berjalan. Test webhook hanya muncul saat mode Test (klik Execute). Production webhook berjalan saat Active.

---

### 9.1 Workflow 1: Telegram Chat + RAG

**Nama**: `[1] Telegram Chat + RAG`
**Trigger**: Pesan masuk ke Telegram Bot

```
[Telegram Trigger] → [Code: Extract & Validate] → [PG: Get Persona]
  → [PG: Upsert Conv] → [PG: Get History]
  → [HTTP: Embed Query] → [Code: Format Embedding]
  → [PG: Vector Search] → [Code: Build LLM Payload]
  → [HTTP: OpenRouter] → [PG: Save Messages]
  → [Telegram: Send Reply]

  ⚠️ Error Branch (semua node):
  → [Error Trigger] → [Telegram: Send Error Message to User]
```

> 💡 **Error Handling**: Klik **Settings** (gear icon) di workflow → **Error Workflow** → pilih workflow ini sendiri atau buat dedicated error handler workflow. Tambahkan **Error Trigger** node yang akan menangkap semua error.

---

**Node 1: Telegram Trigger**

| Setting | Value |
|---------|-------|
| Type | `Telegram Trigger` |
| Credential | `Telegram Bot` |
| Updates | `Message` |

---

**Node 2: Code — Extract Data**

| Setting | Value |
|---------|-------|
| Type | `Code` |
| Mode | Run Once for Each Item |

```javascript
// Ekstrak data penting dari Telegram update + validasi
const message = $json.message;

// Validasi: pastikan ada pesan teks
if (!message?.text || message.text.trim() === '') {
  // Abaikan update tanpa teks (misal: foto, sticker)
  return [];
}

return [{
  json: {
    chatId: message.chat.id,
    messageText: message.text.trim(),
    sessionId: `telegram_${message.chat.id}`,
    firstName: message.from?.first_name || 'User'
  }
}];
```

---

**Node 3: PostgreSQL — Get Active Persona**

| Setting | Value |
|---------|-------|
| Type | `PostgreSQL` |
| Credential | `Chatbot PostgreSQL` |
| Operation | `Execute Query` |
| Query | `SELECT id, name, system_prompt FROM agent_personas WHERE is_active = TRUE LIMIT 1` |

---

**Node 4: PostgreSQL — Upsert Conversation**

| Setting | Value |
|---------|-------|
| Type | `PostgreSQL` |
| Operation | `Execute Query` |

```sql
INSERT INTO conversations (session_id, source, telegram_chat_id)
VALUES ($1, 'telegram', $2)
ON CONFLICT (session_id)
DO UPDATE SET updated_at = NOW()
RETURNING id
```

> Di bagian **Additional Fields → Query Parameters** (klik Add Parameter):
```json
["{{ $('Code: Extract Data').first().json.sessionId }}", "{{ $('Code: Extract Data').first().json.chatId }}"]
```

---

**Node 5: PostgreSQL — Get Chat History**

| Setting | Value |
|---------|-------|
| Type | `PostgreSQL` |
| Operation | `Execute Query` |

```sql
SELECT role, content
FROM messages
WHERE conversation_id = $1
ORDER BY created_at DESC
LIMIT 10
```

Query Parameters:
```json
["{{ $json.id }}"]
```

---

**Node 6: HTTP Request — Generate Embedding**

| Setting | Value |
|---------|-------|
| Type | `HTTP Request` |
| Method | `POST` |
| URL | `https://api.openai.com/v1/embeddings` |
| Authentication | `Generic Credential Type` → pilih `Header Auth`, buat credential baru |
| Header Name | `Authorization` |
| Header Value | `Bearer sk-xxxx-OpenAI-key-kamu` |
| Body Content Type | `JSON` |

Body (JSON):
```json
{
  "model": "text-embedding-3-small",
  "input": "={{ $('Code: Extract Data').first().json.messageText }}"
}
```

> 💡 **Cara setting Header Auth baru**:
> Di field Authentication, pilih `Generic Credential Type`, lalu `Header Auth`, klik create new:
> - Name: `Authorization`
> - Value: `Bearer sk-xxxxxxx` (OpenAI key kamu)
> Beri nama credential: `OpenAI Header Auth`

---

**Node 7: Code — Format Embedding**

```javascript
// Ambil array embedding dari response OpenAI
// pgvector butuh format string "[0.1, 0.2, ...]"
const embedding = $json.data[0].embedding;
const embeddingStr = JSON.stringify(embedding);

return [{
  json: {
    embeddingStr,
    // Bawa serta data dari node sebelumnya yang kita butuhkan
    messageText: $('Code: Extract Data').first().json.messageText,
    sessionId: $('Code: Extract Data').first().json.sessionId,
    chatId: $('Code: Extract Data').first().json.chatId,
    conversationId: $('PG: Upsert Conversation').first().json.id,
    systemPrompt: $('PG: Get Active Persona').first().json.system_prompt || 'You are a helpful assistant.'
  }
}];
```

---

**Node 8: PostgreSQL — Vector Search**

```sql
SELECT content,
       1 - (embedding <=> $1::vector) AS similarity
FROM document_chunks
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT 5
```

Query Parameters:
```json
["{{ $json.embeddingStr }}"]
```

> **Penjelasan query**: `<=>` adalah operator cosine distance di pgvector. `1 - distance` = similarity score. Semakin tinggi similarity, semakin relevan chunk tersebut.

---

**Node 9: Code — Build LLM Payload**

```javascript
// Ambil data dari berbagai node sebelumnya
const systemPrompt = $('Code: Format Embedding').first().json.systemPrompt;
const messageText  = $('Code: Format Embedding').first().json.messageText;
const conversationId = $('Code: Format Embedding').first().json.conversationId;

// Ambil riwayat chat (di-reverse karena query ORDER BY DESC)
const historyItems = $('PG: Get Chat History').all().reverse();

// Ambil hasil RAG (context dari dokumen)
const ragChunks = $('PG: Vector Search').all();

// Bangun context string dari hasil RAG
let contextSection = '';
// Threshold 0.7 → hanya chunk yang benar-benar relevan
// Limit 3 chunks → mengurangi noise dan biaya token
const relevantChunks = ragChunks
  .filter(c => c.json.similarity > 0.7)
  .slice(0, 3);
if (relevantChunks.length > 0) {
  contextSection = '\n\n---\nRelevant context from knowledge base:\n' +
    relevantChunks.map((c, i) => `[Source ${i+1}]: ${c.json.content}`).join('\n\n') +
    '\n---\nUse the above context to answer if relevant. If the context is not relevant to the question, ignore it.\n';
}

// Susun array messages untuk LLM
const messages = [
  {
    role: 'system',
    content: systemPrompt + contextSection
  }
];

// Tambahkan riwayat chat
for (const item of historyItems) {
  messages.push({
    role: item.json.role,
    content: item.json.content
  });
}

// Tambahkan pesan user saat ini
messages.push({ role: 'user', content: messageText });

return [{
  json: {
    messages,
    conversationId,
    messageText // butuh untuk disimpan ke DB
  }
}];
```

---

**Node 10: HTTP Request — OpenRouter Chat**

| Setting | Value |
|---------|-------|
| Method | `POST` |
| URL | `https://openrouter.ai/api/v1/chat/completions` |
| Authentication | `Generic Credential Type` → `Header Auth`, buat baru |
| Header Name | `Authorization` |
| Header Value | `Bearer sk-or-v1-xxxxx` |

Tambahkan Header kedua:
| Name | Value |
|------|-------|
| `HTTP-Referer` | `http://localhost:5173` |
| `X-Title` | `Chatbot Bootcamp` |

Body (JSON):
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": "={{ $json.messages }}",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

> 💡 Model lain yang bisa dicoba di OpenRouter: `anthropic/claude-3-haiku`, `google/gemini-flash-1.5`, `mistralai/mistral-7b-instruct` (gratis tapi terbatas)

---

**Node 11: PostgreSQL — Save Messages**

```sql
INSERT INTO messages (conversation_id, role, content) VALUES
($1, 'user', $2),
($1, 'assistant', $3)
```

Query Parameters:
```json
[
  "{{ $('Code: Build LLM Payload').first().json.conversationId }}",
  "{{ $('Code: Build LLM Payload').first().json.messageText }}",
  "{{ $json.choices[0].message.content }}"
]
```

---

**Node 12: Telegram — Send Reply**

| Setting | Value |
|---------|-------|
| Type | `Telegram` |
| Credential | `Telegram Bot` |
| Operation | `Send Message` |
| Chat ID | `={{ $('Code: Extract Data').first().json.chatId }}` |
| Text | `={{ $('HTTP: OpenRouter').first().json.choices[0].message.content }}` |

---

**Aktifkan Workflow 1**: Toggle **Inactive** → **Active**. Test dengan kirim pesan ke bot Telegram.

---

### 9.2 Workflow 2: Web Chat API + RAG

**Nama**: `[2] Web Chat API`
**Trigger**: HTTP POST dari React frontend

Workflow ini SAMA dengan Workflow 1, hanya berbeda di:
- Node 1: **Webhook** (bukan Telegram Trigger)
- Node 2: **Code: Extract & Validate** membaca dari HTTP body + validasi input
- Node 12: **Respond to Webhook** (bukan Telegram Send)
- Error handling: return HTTP 500 dengan JSON error (bukan kirim Telegram)

> ⚠️ **Error Handling**: Di workflow Settings, set Error Workflow. Pada Error Trigger, gunakan **Respond to Webhook** node dengan Response Code `500` dan body `{ "error": "Internal server error", "code": 500 }`.

---

**Node 1: Webhook**

| Setting | Value |
|---------|-------|
| Type | `Webhook` |
| HTTP Method | `POST` |
| Path | `chat` |
| Response Mode | `Using Respond to Webhook Node` |

URL yang terbuat: `http://localhost:5678/webhook/chat`
(dari React, lewat Vite proxy: `POST /api/webhook/chat`)

---

**Node 2: Code — Extract Data**

```javascript
// Request body dari React: { message, sessionId }
const body = $json.body;

// Validasi input
if (!body?.message || body.message.trim() === '') {
  // Akan ditangkap oleh IF node berikutnya untuk return 400
  return [{
    json: {
      error: 'Field "message" wajib diisi dan tidak boleh kosong',
      isValid: false
    }
  }];
}

return [{
  json: {
    messageText: body.message.trim(),
    sessionId: body.sessionId || `web_${Date.now()}`,
    source: 'web',
    isValid: true
  }
}];
```

> 💡 **Validation Flow**: Setelah node ini, tambahkan **IF node**:
> - Condition: `{{ $json.isValid }}` equals `true`
> - True → lanjut ke Node 3 (Get Persona)
> - False → **Respond to Webhook** dengan Response Code `400` dan body `{ "error": "{{ $json.error }}" }`

---

Nodes 3–11 **sama persis** dengan Workflow 1, dengan penyesuaian:
- Node 4 (Upsert Conversation): ubah `'telegram'` → `$('Code: Extract Data').first().json.source` dan set `telegram_chat_id` ke NULL
- Referensi node sesuaikan namanya

---

**Node 12: Respond to Webhook**

| Setting | Value |
|---------|-------|
| Type | `Respond to Webhook` |
| Response Mode | `Using Respond to Webhook Node` |
| Response Code | `200` |
| Response Body | JSON |

Body JSON:
```json
{
  "reply": "={{ $('HTTP: OpenRouter').first().json.choices[0].message.content }}",
  "sessionId": "={{ $('Code: Extract Data').first().json.sessionId }}"
}
```

---

### 9.3 Workflow 3: Persona CRUD API

**Nama**: `[3] Persona Management API`

Buat **5 workflow terpisah** untuk masing-masing operasi, atau gunakan **1 workflow dengan Switch node**. Di sini kita pakai pendekatan 1 workflow + Switch:

```
[Webhook: /personas] → [Switch: by HTTP Method] 
  → GET all → [PG: SELECT] → [Respond]
  → POST create → [PG: INSERT] → [Respond]
  → PUT update → [PG: UPDATE] → [Respond]
  → DELETE → [PG: DELETE] → [Respond]
  → POST activate → [PG: UPDATE is_active] → [Respond]
```

> **Pendekatan lebih simple untuk bootcamp**: Buat 5 webhook endpoint terpisah (5 workflow berbeda). Lebih mudah di-debug dan dipahami.

---

**Workflow 3a: GET /personas** — List semua personas

Node 1 — Webhook:
- Method: `GET`, Path: `personas`

Node 2 — PostgreSQL:
```sql
SELECT id, name, description, system_prompt, is_active, created_at
FROM agent_personas
ORDER BY created_at DESC
```

Node 3 — Respond to Webhook:
```json
{ "data": "={{ $json }}" }
```

---

**Workflow 3b: POST /personas** — Buat persona baru

Node 1 — Webhook:
- Method: `POST`, Path: `personas`

Node 2 — PostgreSQL:
```sql
INSERT INTO agent_personas (name, description, system_prompt, is_active)
VALUES ($1, $2, $3, FALSE)
RETURNING *
```
Params: `["{{ $json.body.name }}", "{{ $json.body.description }}", "{{ $json.body.system_prompt }}"]`

Node 3 — Respond to Webhook:
```json
{ "data": "={{ $json }}", "message": "Persona created" }
```

---

**Workflow 3c: PUT /personas/:id** — Update persona

Node 1 — Webhook:
- Method: `PUT`, Path: `personas/:id`

Node 2 — PostgreSQL:
```sql
UPDATE agent_personas
SET name = $2, description = $3, system_prompt = $4
WHERE id = $1::uuid
RETURNING *
```
Params:
```json
[
  "{{ $json.params.id }}",
  "{{ $json.body.name }}",
  "{{ $json.body.description }}",
  "{{ $json.body.system_prompt }}"
]
```

---

**Workflow 3d: DELETE /personas/:id** — Hapus persona

Node 1 — Webhook:
- Method: `DELETE`, Path: `personas/:id`

Node 2 — PostgreSQL:
```sql
DELETE FROM agent_personas WHERE id = $1::uuid AND is_active = FALSE
```
> Tidak bisa hapus persona yang sedang aktif.

Params: `["{{ $json.params.id }}"]`

---

**Workflow 3e: POST /personas/:id/activate** — Set persona aktif

Node 1 — Webhook:
- Method: `POST`, Path: `personas/:id/activate`

Node 2 — PostgreSQL (atomic activation — menggunakan function dari init.sql):
```sql
SELECT * FROM activate_persona($1::uuid)
```
> ✅ **Fix Race Condition**: Menggunakan fungsi `activate_persona()` yang didefinisikan di `init.sql`. Fungsi ini menjalankan deactivate-all + activate-one dalam satu transaksi, mencegah race condition jika 2 request datang bersamaan.

Params: `["{{ $json.params.id }}"]`

Node 3 — Respond to Webhook:
```json
{ "data": "={{ $json }}", "message": "Persona activated" }
```

---

### 9.4 Workflow 4: Document Upload & Embedding (RAG Pipeline)

**Nama**: `[4] Document Upload`
**Trigger**: POST dari React frontend dengan file (multipart/form-data)

```
[Webhook] → [Code: Validate & Read Metadata] → [IF: Valid?]
   → No: [Respond 400]
   → Yes: [PG: Check Duplicate] → [IF: Duplicate?]
      → Yes: [Respond 409 Conflict]
      → No: [IF: PDF atau TXT?]
         → PDF: [Extract from File]
         → TXT: [Code: Read as Text]
      → [Code: Chunk] → [PG: Insert Document]
      → [Split In Batches] → [HTTP: Embed Chunk]
      → [Code: Merge Data] → [PG: Insert Chunk] → [Loop]
      → [Respond]
```

---

**Node 1: Webhook**

| Setting | Value |
|---------|-------|
| Method | `POST` |
| Path | `documents` |
| Binary Property | Aktifkan "Binary Data" → `data` |

---

**Node 2: Code — Read Metadata**

```javascript
// Ambil metadata dari form fields dan binary info + validasi
const binaryData = $binary?.data;

// Validasi: pastikan ada file
if (!binaryData) {
  return [{
    json: {
      isValid: false,
      error: 'No file uploaded. Please attach a PDF or TXT file.'
    }
  }];
}

const mimeType = binaryData.mimeType || '';
const fileName = binaryData.fileName || 'unknown';
const fileSize = binaryData.fileSize || 0;

// Validasi tipe file
const allowedTypes = ['application/pdf', 'text/plain'];
const isAllowedExt = fileName.endsWith('.pdf') || fileName.endsWith('.txt');
if (!allowedTypes.includes(mimeType) && !isAllowedExt) {
  return [{
    json: {
      isValid: false,
      error: `File type "${mimeType}" not supported. Only PDF and TXT are allowed.`
    }
  }];
}

// Validasi ukuran file (max 10MB)
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (fileSize > MAX_SIZE) {
  return [{
    json: {
      isValid: false,
      error: `File too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`
    }
  }];
}

// Generate simple hash dari fileName + fileSize untuk deteksi duplikat
const fileHash = require('crypto')
  .createHash('sha256')
  .update(fileName + '|' + fileSize)
  .digest('hex');

return [{
  json: {
    isValid: true,
    title: $json.body?.title || fileName.replace(/\.[^/.]+$/, '') || 'Untitled Document',
    fileName,
    fileType: mimeType,
    fileSize,
    fileHash
  },
  binary: $binary  // teruskan binary data ke node berikutnya
}];
```

> 💡 **Validation Flow**: Setelah node ini, tambahkan **IF node**:
> - Condition: `{{ $json.isValid }}` equals `true`
> - True → lanjut ke Node Duplicate Check
> - False → **Respond to Webhook** dengan Response Code `400` dan body `{ "error": "{{ $json.error }}" }`

**Node 2b: PostgreSQL — Check Duplicate**

```sql
SELECT id, title FROM documents WHERE file_hash = $1 LIMIT 1
```
Params: `["{{ $json.fileHash }}"]`

> Jika ada hasil, respond dengan HTTP 409: `{ "error": "Document already exists", "existingId": "...", "existingTitle": "..." }`

---

**Node 3: IF — Cek Tipe File**

| Setting | Value |
|---------|-------|
| Condition | `{{ $json.fileType }}` contains `pdf` |
| True branch | → Node 4a (Extract PDF) |
| False branch | → Node 4b (Read TXT) |

---

**Node 4a: Extract from File** (untuk PDF)

| Setting | Value |
|---------|-------|
| Type | `Extract from File` |
| Operation | `PDF` |
| Binary Property | `data` |

---

**Node 4b: Code — Read Text** (untuk TXT)

```javascript
// Baca binary data sebagai plain text
const binaryData = $input.first().binary.data;
const buffer = Buffer.from(binaryData.data, 'base64');
const text = buffer.toString('utf-8');

return [{ json: { text, ...$json } }];
```

---

**Node 5: Merge** (gabungkan output PDF dan TXT path)

| Setting | Value |
|---------|-------|
| Mode | `Combine → Append` |

---

**Node 6: Code — Split Into Chunks**

```javascript
// Pecah teks menjadi chunks untuk RAG
// Menggunakan sentence-aware chunking untuk kualitas embedding yang lebih baik
const text = $json.text || '';
const title = $json.title || 'Untitled';
const fileName = $json.fileName;
const fileType = $json.fileType;
const fileSize = $json.fileSize;
const fileHash = $json.fileHash;

const CHUNK_SIZE = 600;   // karakter per chunk (sweet spot untuk text-embedding-3-small)
const OVERLAP = 100;      // overlap antar chunk

// Helper: cari titik potong terbaik (di akhir kalimat atau paragraf)
function findBestBreak(text, targetPos) {
  // Cari paragraph break (\n\n) terdekat
  const paragraphBreak = text.lastIndexOf('\n\n', targetPos);
  if (paragraphBreak > targetPos - 150) return paragraphBreak + 2;
  
  // Cari sentence break (. ) terdekat
  const sentenceBreak = text.lastIndexOf('. ', targetPos);
  if (sentenceBreak > targetPos - 100) return sentenceBreak + 2;
  
  // Fallback ke posisi target
  return targetPos;
}

const chunks = [];
let start = 0;
let index = 0;

while (start < text.length) {
  let end = Math.min(start + CHUNK_SIZE, text.length);
  
  // Jika bukan di akhir teks, cari titik potong yang lebih baik
  if (end < text.length) {
    end = findBestBreak(text, end);
  }
  
  const chunkText = text.slice(start, end).trim();
  
  if (chunkText.length > 50) { // abaikan chunk yang terlalu pendek
    chunks.push({
      json: {
        chunkText,
        chunkIndex: index,
        totalChunks: 0, // akan di-update
        title,
        fileName,
        fileType,
        fileSize,
        fileHash
      }
    });
    index++;
  }
  start = end > start ? Math.max(end - OVERLAP, start + 1) : start + CHUNK_SIZE;
}

// Update totalChunks di setiap item
return chunks.map((c, i) => ({
  ...c,
  json: { ...c.json, totalChunks: chunks.length }
}));
```

> 💡 **Chunking Improvement**: Chunk size diturunkan ke 600 karakter (dari 800) karena ini sweet spot untuk `text-embedding-3-small`. Chunking sekarang **sentence-aware** — mencari titik potong di akhir kalimat atau paragraf terdekat, bukan memotong di tengah kata.

---

**Node 7: PostgreSQL — Insert Document Record**

> Kita perlu document_id sebelum insert chunks. Tapi setiap chunk akan punya data yang sama di sini. Solusi: jalankan INSERT sekali, simpan hasilnya.
> 
> **Trick**: Gunakan **"Run Once for All Items"** mode di Code node sebelum ini untuk mengambil metadata dari item pertama, lalu INSERT.

Ubah Node 6 menjadi dua node:
- Node 6: Split chunks (seperti di atas)
- Node 7a: Code — Ambil metadata (mode: Run Once for All Items)

```javascript
// Hanya ambil dari item pertama untuk metadata dokumen
const firstItem = $input.first().json;
return [{
  json: {
    title: firstItem.title,
    fileName: firstItem.fileName,
    fileType: firstItem.fileType,
    fileSize: firstItem.fileSize,
    fileHash: firstItem.fileHash,
    totalChunks: $input.all().length
  }
}];
```

Node 7b: PostgreSQL — INSERT document:
```sql
INSERT INTO documents (title, file_name, file_type, file_size, file_hash, chunk_count)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id
```
Params: `["{{ $json.title }}", "{{ $json.fileName }}", "{{ $json.fileType }}", "{{ $json.fileSize }}", "{{ $json.fileHash }}", "{{ $json.totalChunks }}"]`

---

**Node 8: Split In Batches**

| Setting | Value |
|---------|-------|
| Batch Size | `1` |

> Memproses satu chunk dalam satu iterasi. Ini mengaktifkan loop.

---

**Node 9: HTTP Request — Embed Chunk**

Sama seperti Node 6 di Workflow 1, tapi input dari chunkText:

Body:
```json
{
  "model": "text-embedding-3-small",
  "input": "={{ $json.chunkText }}"
}
```

---

**Node 10: Code — Merge Embedding + Chunk Data**

```javascript
// $json = response OpenAI (ada data[0].embedding)
// Kita butuh: documentId (dari node 7b) dan chunk data (dari node 6)
const embedding = $json.data[0].embedding;

// Akses data chunk dari Split In Batches context
// Dalam loop, node ini hanya punya 1 item yang sedang diproses
const chunkData = $('Code: Split Chunks').first().json; // item aktif di loop
const documentId = $('PG: Insert Document').first().json.id;

return [{
  json: {
    documentId,
    chunkText: chunkData.chunkText,
    chunkIndex: chunkData.chunkIndex,
    embeddingStr: JSON.stringify(embedding)
  }
}];
```

---

**Node 11: PostgreSQL — Insert Chunk with Embedding**

```sql
INSERT INTO document_chunks (document_id, content, embedding, chunk_index)
VALUES ($1::uuid, $2, $3::vector, $4)
```

Params:
```json
[
  "{{ $json.documentId }}",
  "{{ $json.chunkText }}",
  "{{ $json.embeddingStr }}",
  "{{ $json.chunkIndex }}"
]
```

---

**Node 12: Loop — Kembali ke Node 8**

Connect output "loop" dari Split In Batches kembali ke input Split In Batches. Connect output "done" ke Node 13.

---

**Node 13: Respond to Webhook**

```json
{
  "message": "Document uploaded and indexed successfully",
  "documentId": "={{ $('PG: Insert Document').first().json.id }}"
}
```

---

### 9.5 Workflow 5: Document List & Delete

**Workflow 5a: GET /documents**

Node 1 — Webhook: `GET /documents`

Node 2 — PostgreSQL:
```sql
SELECT id, title, file_name, file_type, file_size, chunk_count, created_at
FROM documents
ORDER BY created_at DESC
```

Node 3 — Respond: `{ "data": "={{ $json }}" }`

---

**Workflow 5b: DELETE /documents/:id**

Node 1 — Webhook: `DELETE /documents/:id`

Node 2 — PostgreSQL:
```sql
DELETE FROM documents WHERE id = $1::uuid
```
Params: `["{{ $json.params.id }}"]`
> `ON DELETE CASCADE` di schema akan otomatis hapus semua `document_chunks` terkait.

Node 3 — Respond: `{ "message": "Document deleted" }`

---

### 9.6 Workflow 6: Health Check API

**Nama**: `[6] Health Check`
**Trigger**: GET `/webhook/health`

**Node 1: Webhook**
- Method: `GET`, Path: `health`

**Node 2: PostgreSQL**
- Operation: `Execute Query`
- Query: `SELECT 1 as connected`

**Node 3: Respond to Webhook**
- Response Code: `200`
- Body: 
```json
{
  "status": "ok",
  "timestamp": "={{ new Date().toISOString() }}",
  "dbConnected": "={{ $json.connected === 1 }}"
}
```

---

### Ringkasan Semua Endpoints

| Method | Path (Vite Proxy) | n8n Webhook URL |
|--------|-------------------|-----------------|
| POST | `/api/webhook/chat` | `POST /webhook/chat` |
| GET | `/api/webhook/personas` | `GET /webhook/personas` |
| POST | `/api/webhook/personas` | `POST /webhook/personas` |
| PUT | `/api/webhook/personas/:id` | `PUT /webhook/personas/:id` |
| DELETE | `/api/webhook/personas/:id` | `DELETE /webhook/personas/:id` |
| POST | `/api/webhook/personas/:id/activate` | `POST /webhook/personas/:id/activate` |
| GET | `/api/webhook/documents` | `GET /webhook/documents` |
| POST | `/api/webhook/documents` | `POST /webhook/documents` |
| DELETE | `/api/webhook/documents/:id` | `DELETE /webhook/documents/:id` |
| GET | `/api/webhook/health` | `GET /webhook/health` |

---

## 10. Phase 6 — Frontend React App

### 10.1 Buat Project

```bash
# Dari dalam folder chatbot-project/
npm create vite@latest chatbot-ui -- --template react-ts
cd chatbot-ui

# Install dependencies
npm install

# Tambahkan library yang dibutuhkan
npm install zustand axios react-router-dom
npm install -D tailwindcss@3.4.17 postcss autoprefixer @types/node

# Setup Tailwind
npx tailwindcss init -p
```

### 10.2 Konfigurasi `vite.config.ts`

Ganti isi `vite.config.ts` dengan:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Semua request ke /api/... akan di-forward ke n8n di port 5678
      // Browser akan "melihatnya" sebagai request ke localhost:5173 (no CORS!)
      '/api': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 10.3 Konfigurasi Tailwind

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1a2e',
        primary: '#3b82f6',
        secondary: '#e5e7eb'
      }
    }
  },
  plugins: [],
}
```

Edit `src/index.css`, ganti semua isinya dengan:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 10.4 Jalankan Dev Server

```bash
npm run dev
```

Buka http://localhost:5173

---

## 🤖 Antigravity Build Prompt — Frontend

> Copy prompt di bawah ini ke Antigravity IDE untuk generate semua code frontend secara otomatis.

---

```
## PROJECT: AI Chatbot Frontend (Bootcamp Project)

### Tech Stack
- React 18 + TypeScript
- Vite (dev server sudah dikonfigurasi dengan proxy ke n8n di localhost:5678)
- Zustand (state management)
- Axios (HTTP client)
- React Router v6 (routing)
- Tailwind CSS (styling)

### Project sudah ada di folder: chatbot-ui/
### Sudah ada: vite.config.ts dengan proxy, tailwind.config.js, index.css

---

### CONTEXT: Backend adalah n8n yang expose REST API berikut.
### Semua request dari React ke /api/webhook/* akan di-proxy ke http://localhost:5678/webhook/*

API ENDPOINTS:
- POST   /api/webhook/chat                         → { message: string, sessionId: string } → { reply: string, sessionId: string }
- GET    /api/webhook/personas                     → { data: Persona[] }
- POST   /api/webhook/personas                     → { name, description, system_prompt } → { data: Persona }
- PUT    /api/webhook/personas/:id                 → { name, description, system_prompt } → { data: Persona }
- DELETE /api/webhook/personas/:id                 → { message: string }
- POST   /api/webhook/personas/:id/activate        → {} → { data: Persona }
- GET    /api/webhook/documents                    → { data: Document[] }
- POST   /api/webhook/documents                    → FormData { file: File, title: string } → { message, documentId }
- DELETE /api/webhook/documents/:id                → { message: string }

TYPE DEFINITIONS (buat di src/types/index.ts):
```ts
export interface Persona {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  is_active: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

---

### FILE STRUCTURE TO CREATE:

src/
├── types/
│   └── index.ts
├── api/
│   └── client.ts          ← axios instance + semua API functions
├── stores/
│   ├── chatStore.ts       ← Zustand store untuk chat
│   ├── personaStore.ts    ← Zustand store untuk personas
│   └── documentStore.ts   ← Zustand store untuk documents
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx    ← Navigasi kiri: Chat | Personas | Documents
│   │   └── Layout.tsx     ← Wrapper utama dengan sidebar
│   ├── chat/
│   │   ├── ChatWindow.tsx ← Scrollable area berisi MessageBubble list
│   │   ├── MessageBubble.tsx ← Satu pesan (user = kanan biru, AI = kiri abu)
│   │   └── ChatInput.tsx  ← Input box + Send button + loading state
│   ├── personas/
│   │   ├── PersonaCard.tsx   ← Card dengan nama, deskripsi, badge Active, tombol Edit/Delete/Activate
│   │   └── PersonaForm.tsx   ← Modal form untuk Create/Edit persona
│   └── documents/
│       ├── DocumentCard.tsx  ← Card dengan nama file, ukuran, jumlah chunks, tombol Delete
│       └── DocumentUpload.tsx ← Drag & drop area + file picker + tombol Upload
├── pages/
│   ├── ChatPage.tsx       ← Layout dua kolom: info persona aktif (kiri) + chat (kanan)
│   ├── PersonasPage.tsx   ← Grid PersonaCard + tombol Create New (+ PersonaForm modal)
│   └── DocumentsPage.tsx  ← DocumentUpload (atas) + DocumentCard list (bawah)
├── App.tsx                ← Router setup
└── main.tsx               ← Entry point

---

### REQUIREMENTS PER FILE:

#### src/api/client.ts
- Buat axios instance dengan baseURL: '/api/webhook'
- Buat fungsi: sendMessage(message, sessionId), getPersonas(), createPersona(data), updatePersona(id, data), deletePersona(id), activatePersona(id), getDocuments(), uploadDocument(formData), deleteDocument(id)
- Handle error dengan try/catch, throw error dengan pesan yang readable

#### src/stores/chatStore.ts (Zustand)
```ts
interface ChatStore {
  messages: Message[];
  sessionId: string;       // dari localStorage, generate UUID jika belum ada
  isLoading: boolean;
  isBackendConnected: boolean; // untuk ngecek health endpoint
  checkHealth: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;  // calls API, update messages
  clearChat: () => void;   // clear messages tapi session sama
  newSession: () => void;  // generate sessionId baru, reset messages
}
```
- sessionId disimpan ke localStorage dengan key 'chatbot_session_id'
- Gunakan nanoid atau crypto.randomUUID() untuk generate UUID baru

#### src/stores/personaStore.ts (Zustand)
```ts
interface PersonaStore {
  personas: Persona[];
  isLoading: boolean;
  fetchPersonas: () => Promise<void>;
  createPersona: (data: Omit<Persona, 'id' | 'is_active' | 'created_at'>) => Promise<void>;
  updatePersona: (id: string, data: Partial<Persona>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  activatePersona: (id: string) => Promise<void>;
}
```

#### src/stores/documentStore.ts (Zustand)
```ts
interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  uploadProgress: number;    // 0-100, untuk progress bar
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, title: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}
```

---

### UI/UX REQUIREMENTS:

#### General
- Color scheme: Dark sidebar (#1a1a2e) + light main content (#f8f9fa)
- Font: Inter (import dari Google Fonts di index.html)
- Smooth transitions untuk loading states
- Toast notifications untuk sukses/error (buat komponen Toast sederhana)
- Responsive: mobile-friendly (sidebar collapse di mobile)

#### ChatPage
- Sidebar kiri (width: 60px atau collapsed): ikon Chat, Personas, Documents
- Header: nama dan deskripsi active persona, **ID Session saat ini**, tombol "New Session", tombol "Clear Chat"
- Error Banner: Tampilkan banner merah jika `isBackendConnected === false` (misal: "Backend n8n is not running or unreachable")
- ChatWindow: auto-scroll ke bawah saat ada pesan baru
- MessageBubble user: align kanan, background biru (`bg-primary`), text putih, avatar huruf pertama nama
- MessageBubble AI: align kiri, background abu (`bg-secondary`), text hitam, ikon robot
- ChatInput: textarea (auto-resize, max 3 baris) + tombol Send + disable saat loading atau backend disconnect
- Loading indicator: typing animation (3 dots bouncing) di ChatWindow saat AI merespons

#### PersonasPage
- Header: judul "AI Personas" + tombol "+ New Persona" (kanan)
- Grid responsive (1-2-3 kolom tergantung lebar layar)
- PersonaCard:
  - Badge "ACTIVE" berwarna hijau jika is_active = true
  - Nama persona (heading)
  - Deskripsi (1-2 baris, truncate)
  - Preview system_prompt (max 3 baris, collapse)
  - Tombol: "Activate" (disable jika sudah aktif), "Edit", "Delete" (disable jika aktif)
- PersonaForm: modal overlay dengan form fields: Name, Description (textarea), System Prompt (textarea besar)
- Konfirmasi delete dengan window.confirm

#### DocumentsPage
- DocumentUpload component:
  - Drag & drop area dengan border dashed + ikon upload
  - Input file tersembunyi, trigger via klik
  - File type filter: .pdf, .txt
  - Field "Title" (auto-fill dari filename, bisa diubah)
  - Progress bar animasi saat upload
  - Supported types info: "Supported: PDF, TXT"
- DocumentCard:
  - Ikon file (PDF = merah, TXT = biru)
  - Nama dokumen dan filename asli
  - Badge: file size + chunk count
  - Tanggal upload
  - Tombol Delete (merah, konfirmasi)

---

### ROUTING (App.tsx):
```
/        → redirect ke /chat
/chat    → ChatPage
/personas → PersonasPage
/documents → DocumentsPage
```

---

### SIDE NOTES:
- Gunakan useEffect untuk fetch data saat page mount
- Tampilkan empty state yang informatif (contoh: "No personas yet. Create your first AI persona!")
- Semua API calls di store, bukan di komponen langsung
- Tailwind only untuk styling, tidak pakai inline style atau CSS modules
- Komponen harus functional, gunakan React hooks
- TypeScript strict, tidak ada 'any' kecuali terpaksa
- Error boundaries tidak perlu, cukup error state di masing-masing store
- Tidak perlu authentication — aplikasi berjalan lokal
```

---

## 11. Phase 7 — Integration Testing

### Checklist Test Manual

**Infrastructure:**
```bash
# Cek semua container running
docker compose ps

# Cek koneksi PostgreSQL
docker exec -it chatbot_postgres psql -U chatbot_user -d chatbot_db -c "\dt"
```

**n8n Workflows:**
- [ ] Semua workflow status **Active** (toggle hijau)
- [ ] Test webhook dengan Postman atau curl:
  ```bash
  # Test Web Chat
  curl -X POST http://localhost:5678/webhook/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Halo, siapa kamu?", "sessionId": "test-123"}'
  
  # Test GET Personas
  curl http://localhost:5678/webhook/personas
  
  # Test GET Documents
  curl http://localhost:5678/webhook/documents
  ```

**Telegram:**
- [ ] Kirim `/start` ke bot Telegram
- [ ] Kirim pesan biasa, bot harus merespons
- [ ] Cek tabel `messages` di DB:
  ```bash
  docker exec -it chatbot_postgres psql -U chatbot_user -d chatbot_db \
    -c "SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;"
  ```

**Document Upload (via curl):**
```bash
curl -X POST http://localhost:5678/webhook/documents \
  -F "file=@/path/ke/dokumen.txt" \
  -F "title=Test Document"
```

Verifikasi di DB:
```bash
docker exec -it chatbot_postgres psql -U chatbot_user -d chatbot_db \
  -c "SELECT id, title, chunk_count FROM documents;"

# Cek chunks tersimpan dengan embedding
docker exec -it chatbot_postgres psql -U chatbot_user -d chatbot_db \
  -c "SELECT id, chunk_index, LEFT(content, 50) as preview, (embedding IS NOT NULL) as has_embedding FROM document_chunks LIMIT 5;"
```

**Frontend React:**
- [ ] `npm run dev` berjalan tanpa error
- [ ] Buka http://localhost:5173
- [ ] Chat: kirim pesan, tunggu respons AI
- [ ] Personas: buat persona baru, aktifkan, test chat dengan persona baru
- [ ] Documents: upload file TXT atau PDF, cek chunk_count bertambah
- [ ] Chat setelah upload dokumen: tanyakan sesuatu yang ada di dokumen, AI harus bisa menjawab

**Test RAG:**
```bash
# Upload dokumen test dulu
echo "Nama CEO Anthropic adalah Dario Amodei. Anthropic didirikan tahun 2021." > test.txt

curl -X POST http://localhost:5678/webhook/documents \
  -F "file=@test.txt" \
  -F "title=Info Anthropic"

# Lalu chat dan tanya:
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Siapa CEO Anthropic?", "sessionId": "rag-test"}'
```

AI harus menjawab berdasarkan dokumen yang diupload.

---

## 12. Appendix — Troubleshooting

### Container tidak mau start

```bash
# Lihat error detail
docker compose logs postgres
docker compose logs n8n

# Restart service tertentu
docker compose restart n8n

# Hard reset (HAPUS semua data!)
docker compose down -v
docker compose up -d
```

### n8n tidak bisa konek ke PostgreSQL

Pastikan:
- Credential PostgreSQL menggunakan `Host: postgres` (nama service), **bukan** `localhost`
- Database: `chatbot_db`
- Di dalam Docker network, `postgres` adalah hostname yang benar

### Telegram bot tidak merespons

- Pastikan workflow Telegram **Active** (toggle hijau)
- Pastikan Bot Token benar
- Cek n8n execution log: klik workflow → Executions
- Coba kirim pesan ke bot, tunggu 5-10 detik (polling ada jeda)

### Error vector di PostgreSQL

```sql
-- Cek apakah ekstensi sudah aktif
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Jika belum:
CREATE EXTENSION vector;
```

### CORS error di React

Pastikan Vite proxy dikonfigurasi dengan benar di `vite.config.ts`. Semua API call harus ke `/api/webhook/...`, bukan langsung ke `http://localhost:5678/webhook/...`.

### Embedding dimensi tidak cocok

Jika ganti model embedding, pastikan dimensi di SQL schema cocok:
- `text-embedding-3-small`: 1536 dimensi ✅ (sudah di schema)
- `text-embedding-3-large`: 3072 dimensi
- `text-embedding-ada-002`: 1536 dimensi

Untuk ubah dimensi, perlu drop dan recreate table `document_chunks`.

### Menghentikan semua service

```bash
docker compose stop
```

Untuk hapus total (data hilang):
```bash
docker compose down -v
```

---

## Quick Reference Commands

```bash
# Start semua service
docker compose up -d

# Stop semua service (data tersimpan)
docker compose stop

# Lihat log realtime
docker compose logs -f

# Masuk ke PostgreSQL CLI
docker exec -it chatbot_postgres psql -U chatbot_user -d chatbot_db

# Restart n8n (misal setelah update)
docker compose restart n8n

# Jalankan frontend
cd chatbot-ui && npm run dev

# Buka n8n dashboard
open http://localhost:5678

# Buka frontend
open http://localhost:5173
```

---

*Plan ini mencakup seluruh stack dari zero hingga running. Tanda ✅ tandai setiap langkah yang berhasil diselesaikan.*
