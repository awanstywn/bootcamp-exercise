# Deploy Blog App to Vercel + Supabase with Secure Environment Variables

## Background & Current State

Your **Execora Blog App (v1.5)** is a full-stack monorepo with:

| Layer | Tech | Location |
|-------|------|----------|
| **Client** | React + Vite + SSR + TailwindCSS + Socket.io-client | `client/` |
| **Server** | Express 5 + Prisma + Socket.io + BullMQ | `server/` |
| **Database** | PostgreSQL (via Docker) | `docker-compose.yml` |
| **Cache/Queue** | Redis (via Docker) for caching + BullMQ job queue | `docker-compose.yml` |
| **Shared** | Shared types/utilities | `shared/` |

We will work on the copy at:
```
Module 5/.../07 Building and Deploying Serverless Applications/blog-app-1.5-serverless/
```

---

## What is Upstash Redis and Why Do We Need It?

Your current app uses **Redis** (running in a Docker container) for two things:
1. **Caching** — storing database query results in memory for faster access
2. **BullMQ Job Queues** — scheduling articles to publish at a future time

**The problem:** Vercel runs "serverless functions" — tiny programs that spin up for a few seconds, handle one request, then die. They can't keep a persistent connection to a regular Redis server. Also, you can't run Docker containers on Vercel.

**Upstash Redis** is a **cloud-hosted Redis service** designed specifically for serverless environments. It speaks the exact same Redis protocol (same commands, same libraries), but it lives in the cloud and accepts connections from short-lived serverless functions. Think of it as "Redis as a Service."

| | Your Docker Redis | Upstash Redis |
|---|---|---|
| **Where it runs** | On your machine | In the cloud (managed) |
| **Who maintains it** | You | Upstash |
| **Serverless compatible** | ❌ | ✅ |
| **Free tier** | Free (self-hosted) | Free (10,000 commands/day) |
| **BullMQ works?** | ✅ | ✅ |
| **Same Redis commands?** | ✅ | ✅ |

> [!IMPORTANT]
> **Socket.io (real-time WebSocket notifications)** will be **disabled** in the serverless deployment. Vercel serverless functions cannot hold open WebSocket connections. The rest of the app (including scheduled publishing via BullMQ) will work normally.

---

## Proposed Changes

The work is divided into **6 phases**, each with exact step-by-step instructions.

---

### Phase 1: Create Supabase Project & Get Database URL

**Goal:** Replace your local Docker PostgreSQL with Supabase's managed PostgreSQL.

#### Step 1.1 — Sign In to Supabase

1. Open your browser and go to **[supabase.com/dashboard](https://supabase.com/dashboard)**
2. Log in with your existing account

#### Step 1.2 — Create a New Project

1. On the dashboard, click the **"New project"** button
2. Fill in the form:
   - **Organization:** Select your organization (or create one if needed)
   - **Project name:** `blog-app` (or whatever name you prefer)
   - **Database password:** Create a strong password. **⚠️ IMPORTANT: Copy and save this password somewhere safe** (e.g., a text file on your desktop). You'll need it in the next step.
   - **Region:** Choose **Southeast Asia (Singapore)** — this is closest to Indonesia for best performance
3. Click **"Create new project"**
4. Wait approximately 2 minutes for the project to finish provisioning. You'll see a loading screen — wait until the dashboard fully loads.

#### Step 1.3 — Get Your Database Connection Strings

You need **two** connection strings. Here's how to find them:

1. In your Supabase project dashboard, click the **⚙️ Settings** icon in the left sidebar
2. Click **"Database"** in the settings menu
3. Scroll down to the **"Connection string"** section
4. You'll see tabs: **URI | PSQL | ...**. Click the **"URI"** tab.

**Get Connection String #1: Transaction Mode (for your app)**
1. Make sure **"Transaction"** mode is selected (it uses port **`6543`**)
2. You'll see a URL like:
   ```
   postgresql://postgres.[your-project-ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with the database password you created in Step 1.2
4. **Copy this full URL and save it.** Label it as `DATABASE_URL`

**Get Connection String #2: Session Mode (for migrations only)**
1. Switch to **"Session"** mode (it uses port **`5432`**)
2. You'll see a URL like:
   ```
   postgresql://postgres.[your-project-ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with the same password
4. **Copy this full URL and save it.** Label it as `DIRECT_URL`

> [!TIP]
> **Why two URLs?**
> - **Transaction mode (port 6543)** = uses connection pooling. Perfect for serverless because it efficiently shares a small pool of database connections among many short-lived functions. This is your `DATABASE_URL`.
> - **Session mode (port 5432)** = direct connection. Required for Prisma migrations (which need a dedicated connection that stays open). This is your `DIRECT_URL`.

At this point, you should have saved two URLs that look something like this:
```
DATABASE_URL = postgresql://postgres.abcdefghijk:MySecurePassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL   = postgresql://postgres.abcdefghijk:MySecurePassword123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

---

### Phase 2: Create Upstash Redis Database

**Goal:** Replace your local Docker Redis with Upstash's cloud Redis to keep BullMQ scheduled publishing working.

#### Step 2.1 — Create an Upstash Account

1. Open your browser and go to **[upstash.com](https://upstash.com/)**
2. Click **"Sign Up"** or **"Start for Free"**
3. Sign up using **GitHub** (recommended — quickest method) or email

#### Step 2.2 — Create a Redis Database

1. After logging in, you'll be on the Upstash Console dashboard
2. Click **"Create Database"** (or the **"+"** button)
3. Fill in the form:
   - **Name:** `blog-app-redis`
   - **Primary Region:** Select **`ap-southeast-1`** (Singapore) — closest to Indonesia
   - **Type:** Keep **"Regional"** selected (this is the free option)
   - **Eviction:** Leave unchecked (we don't want data to be automatically deleted)
4. Click **"Create"**

#### Step 2.3 — Get Your Redis Connection URL

1. After creation, you'll be taken to the database details page
2. Look for the section showing connection details
3. Find the **"Endpoint"** section — you need these values:
   - **Endpoint:** something like `noted-piglet-12345.upstash.io`
   - **Port:** `6379`
   - **Password:** a long random string
4. The **Redis URL** format you need is:
   ```
   rediss://default:YOUR_PASSWORD@your-endpoint.upstash.io:6379
   ```
   > Note the **double `s`** in `rediss://` — this means it uses TLS encryption (Upstash requires this)
5. Upstash usually shows a **pre-built connection string** on the page. Look for the `ioredis` tab or `redis://` section and copy the full URL
6. **Save this URL.** Label it as `REDIS_URL`

At this point, you should have saved:
```
REDIS_URL = rediss://default:AbCdEfGhIjKlMnOpQrStUvWxYz@noted-piglet-12345.upstash.io:6379
```

---

### Phase 3: Create Vercel Account and Prepare GitHub Repository

**Goal:** Set up the deployment platform and push your code to GitHub.

#### Step 3.1 — Create a Vercel Account

1. Go to **[vercel.com/signup](https://vercel.com/signup)**
2. Click **"Continue with GitHub"** (recommended — this links your GitHub repos directly)
3. Authorize Vercel to access your GitHub account
4. Complete the onboarding steps (team name, etc.)

#### Step 3.2 — Create a GitHub Repository

1. Go to **[github.com/new](https://github.com/new)**
2. Fill in:
   - **Repository name:** `blog-app-serverless`
   - **Visibility:** Select **Private** (your code doesn't contain secrets, but it's still best practice)
   - **DO NOT** initialize with README, .gitignore, or license (your project already has these)
3. Click **"Create repository"**
4. **Don't close this page yet** — you'll need the repository URL from the next screen

#### Step 3.3 — Push Your Code to GitHub

Open your terminal and run these commands **one at a time**:

```bash
# 1. Navigate to your project directory
cd "/Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module 5 - Advanced Software Development /07 Building and Deploying Severless Applications/blog-app-1.5-serverless"

# 2. Initialize a new Git repository
git init

# 3. Stage all files for commit
git add .

# 4. Create the first commit
git commit -m "Initial commit: Blog App serverless version"

# 5. Set the default branch to 'main'
git branch -M main

# 6. Add your GitHub repository as the remote origin
# ⚠️ Replace YOUR_USERNAME with your actual GitHub username!
git remote add origin https://github.com/YOUR_USERNAME/blog-app-serverless.git

# 7. Push your code to GitHub
git push -u origin main
```

> [!NOTE]
> If Git asks for credentials, you may need to use a **Personal Access Token** instead of your password. Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token.

**After pushing**, refresh the GitHub page — you should see all your project files.

---

### Phase 4: Adapt the Code for Serverless Deployment

**Goal:** Modify the codebase to work with Vercel's serverless model, Supabase, and Upstash Redis.

> [!IMPORTANT]
> This phase lists **every file** that needs to be created or changed. For each file, the **complete new content** is provided — you can copy-paste directly.

---

#### 4.1 — Create `vercel.json` (Project Root)

**What:** Tells Vercel how to build and route your application.
**Where:** Create this file at the project root: `blog-app-1.5-serverless/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.ts": {
      "memory": 256,
      "maxDuration": 10
    }
  }
}
```

> **Why:** This config tells Vercel:
> - Build the Vite client (`client/dist` is the output)
> - Route all `/api/*` requests to a serverless function at `api/index.ts`
> - Give the serverless function 256MB memory and 10 seconds max execution time

---

#### 4.2 — Create `api/index.ts` (Project Root)

**What:** The serverless function entry point that wraps your Express app.
**Where:** Create a new folder `api/` in the project root, then create `index.ts` inside it: `blog-app-1.5-serverless/api/index.ts`

```typescript
/**
 * @fileoverview Vercel Serverless Function Entry Point
 * @objective Wrap the existing Express application as a Vercel Serverless Function.
 * @logic
 * - Imports the fully configured Express `app` from the server source.
 * - Exports it as the default handler for Vercel to invoke on each request.
 * - Vercel automatically maps HTTP requests to this handler.
 */
import app from '../server/src/app.js';

export default app;
```

> **Why:** Vercel needs a single file at `api/index.ts` to know what to run when an API request comes in. This file simply re-exports your existing Express app.

---

#### 4.3 — Modify `server/prisma/schema.prisma`

**What:** Add `url` and `directUrl` to the datasource block so Prisma works with Supabase's connection pooler.
**Where:** [schema.prisma](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/prisma/schema.prisma)

**Find these lines (lines 6-8):**
```prisma
datasource db {
  provider = "postgresql"
}
```

**Replace with:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

> **Why:**
> - `url` tells Prisma to use the pooled connection (Transaction mode, port 6543) for all normal database operations
> - `directUrl` tells Prisma to use the direct connection (Session mode, port 5432) for migrations, which need a dedicated connection

---

#### 4.4 — Modify `server/prisma.config.ts`

**What:** Update the migration config to use the direct URL.
**Where:** [prisma.config.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/prisma.config.ts)

**Replace the entire file with:**
```typescript
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use DIRECT_URL for migrations (requires non-pooled connection)
    // Falls back to DATABASE_URL if DIRECT_URL is not set
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy:5432/dummy",
  },
});
```

> **Why:** Prisma migrations require a direct (non-pooled) database connection. This ensures migrations use `DIRECT_URL` when available.

---

#### 4.5 — Modify `server/src/config/env.ts`

**What:** Add `DIRECT_URL` to the environment schema and make `REDIS_URL` optional for environments without Redis.
**Where:** [env.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/config/env.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview Environment Variables Config and Validation
 * @objective Load, parse, and strictly validate environment variables to guarantee they are present and correctly typed before the app boots.
 * @risk If missing environment variables are not caught early, they can cause unpredictable crashes or silent failures in production.
 * @relations Used globally across the server to access environment variables. Depends on `zod` and `dotenv`.
 * @logic
 * - Loads `.env` from the project root using `dotenv`.
 * - Defines a strict schema using Zod for all required and optional environment keys (e.g., Database URLs, JWT secrets, Cloudinary).
 * - Attempts to parse `process.env`. If it fails, it logs the missing/invalid fields and immediately exits the process with code 1.
 * - Exports the safely typed `env` object.
 */
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root of server
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url(),
  SERVER_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string().optional().default(''),
  CACHE_TTL: z.coerce.number().default(300),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
```

> **What changed:**
> - Added `DIRECT_URL` (optional, for Supabase migrations)
> - Changed `REDIS_URL` from `z.string().url().default('redis://localhost:6379')` to `z.string().optional().default('')` — this makes Redis optional so the app doesn't crash when Redis is unavailable

---

#### 4.6 — Modify `server/src/config/redis.ts`

**What:** Make the Redis connection conditional — if `REDIS_URL` is not set or empty, Redis is disabled gracefully.
**Where:** [redis.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/config/redis.ts)

**Replace the entire file with:**
```typescript
/**
 * @module config/redis
 * @description Redis client configuration (conditional).
 * @relations Provides the core `redisClient` instance used by `server/src/services/cache.service.ts` and gracefully disconnects in `server/src/server.ts`.
 * @logic
 * - Checks if REDIS_URL is configured before attempting to connect.
 * - If REDIS_URL is empty/missing, exports null and logs a warning.
 * - If REDIS_URL starts with 'rediss://', enables TLS (required by Upstash).
 * - Configures a custom retry strategy to gracefully handle temporary disconnects.
 */
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let redisClient: Redis | null = null;

if (env.REDIS_URL) {
  redisClient = new Redis(env.REDIS_URL, {
    // Retry strategy: if Redis disconnects, try to reconnect
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // Don't crash if Redis is unavailable at startup
    maxRetriesPerRequest: 3,
    // Enable TLS if using Upstash (connection starts with 'rediss://')
    tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Connection Error:', err);
  });
} else {
  logger.warn('REDIS_URL not set. Redis features (caching, queues) are disabled.');
}

export { redisClient };
```

> **What changed:**
> - Redis is now created conditionally — `redisClient` can be `null`
> - Added `tls: {}` option when the URL starts with `rediss://` (Upstash requires encrypted connections)
> - Logs a warning instead of crashing when Redis is not configured

---

#### 4.7 — Modify `server/src/services/cache.service.ts`

**What:** Add null checks for `redisClient` so caching gracefully degrades when Redis is unavailable.
**Where:** [cache.service.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/services/cache.service.ts)

**Replace the entire file with:**
```typescript
/**
 * @module services/cache.service
 * @description Provides a high-level abstraction over Redis for caching application data.
 * @relations Utilizes `config/redis.ts`. Used by other business services (like `content.service.ts`) to cache database queries.
 * @logic
 * - Implements a "fail-open" pattern. If Redis is unavailable or crashes, errors are logged to Winston and it gracefully returns `null`, forcing a database query rather than crashing the app.
 * - Supports setting TTLs, deleting specific keys, and bulk invalidation using patterns (`delByPattern`).
 */
import { redisClient } from '../config/redis.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class CacheService {
  /**
   * Get data from cache. Fails open on error or when Redis is unavailable.
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!redisClient) return null; // Redis not available, treat as cache miss
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache GET Error for key ${key}:`, error);
      return null; // Fail-open: if cache fails, pretend it's a cache miss
    }
  }

  /**
   * Save data to cache
   */
  static async set<T>(key: string, data: T, ttlSeconds: number = env.CACHE_TTL): Promise<void> {
    if (!redisClient) return; // Redis not available, silently skip
    try {
      const stringData = JSON.stringify(data);
      await redisClient.setex(key, ttlSeconds, stringData);
    } catch (error) {
      logger.error(`Cache SET Error for key ${key}:`, error);
    }
  }

  /**
   * Delete a specific key
   */
  static async del(key: string): Promise<void> {
    if (!redisClient) return; // Redis not available, silently skip
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache DEL Error for key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern (e.g. "posts:*") using SCAN
   */
  static async delByPattern(pattern: string): Promise<void> {
    if (!redisClient) return; // Redis not available, silently skip
    try {
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          const pipeline = redisClient!.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      });

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error(`Cache delByPattern Error for pattern ${pattern}:`, error);
    }
  }
}
```

> **What changed:**
> - Added `if (!redisClient) return null;` (or `return;`) at the top of every method
> - Used `redisClient!` (non-null assertion) in the `delByPattern` data handler since we already checked for null above
> - This means if Redis is not configured, the app simply skips caching and always queries the database directly

---

#### 4.8 — Modify `server/src/middleware/rateLimiter.middleware.ts`

**What:** Make rate limiting work without Redis by falling back to in-memory storage.
**Where:** [rateLimiter.middleware.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/middleware/rateLimiter.middleware.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview Rate Limiter Middleware
 * @objective Protect API endpoints from abuse by limiting the number of requests per IP address.
 * @risk Without rate limiting, the API is vulnerable to brute-force and DDoS attacks.
 * @relations Used in `app.ts` (globalLimiter) and `upload.routes.ts` (authLimiter).
 * @logic
 * - Uses Redis-backed storage when available for distributed rate limiting.
 * - Falls back to in-memory storage when Redis is not configured (suitable for serverless).
 */
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';

// Helper to create a RedisStore only if Redis is available
function createStore(prefix: string) {
  if (!redisClient) return undefined; // Falls back to express-rate-limit's built-in MemoryStore
  return new RedisStore({
    prefix,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => redisClient!.call(args[0], ...args.slice(1)) as any,
  });
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createStore('rl:global:'),
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Start blocking after 10 requests
  message: {
    status: 'error',
    message: 'Too many attempts from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:auth:'),
});
```

> **What changed:**
> - Created a `createStore()` helper that returns a `RedisStore` only when Redis is available
> - When Redis is not available, it returns `undefined`, which makes `express-rate-limit` automatically use its built-in `MemoryStore` (works fine for serverless)

---

#### 4.9 — Modify `server/src/routes/upload.routes.ts`

**What:** Make the upload rate limiter work without Redis.
**Where:** [upload.routes.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/routes/upload.routes.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview Upload Routes
 * @objective Expose endpoints for securely uploading media files (images) to the backend.
 * @risk Unauthenticated or unthrottled uploads can lead to massive bandwidth or storage bills (Cloudinary).
 * @relations Mounted under `/api/upload`. Uses `UploadService` and `uploadMiddleware` (multer).
 * @logic
 * - Defines `POST /image`.
 * - Requires authentication and minimum AUTHOR role.
 * - Uses multer `uploadMiddleware.single('image')` to parse the incoming multipart form data.
 * - Passes the parsed file buffer to the `UploadService` to send to Cloudinary.
 */
import { Router } from 'express';
import { uploadMiddleware } from '../services/upload.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { UploadController } from '../controllers/upload.controller.js';
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { Role } from '@prisma/client';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 image uploads per hour to prevent Cloudinary abuse
  message: { error: 'Upload limit reached. Please try again later.' },
  // Use RedisStore if Redis is available, otherwise fall back to MemoryStore
  store: redisClient
    ? new RedisStore({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sendCommand: (...args: string[]) => redisClient!.call(args[0], ...args.slice(1)) as any,
      })
    : undefined,
});

router.post(
  '/image',
  uploadLimiter,
  authenticate,
  authorize(Role.ADMIN, Role.AUTHOR, Role.SUBSCRIBER),
  uploadMiddleware.single('image'),
  UploadController.uploadImage
);

export default router;
```

> **What changed:**
> - The `store` property now conditionally uses `RedisStore` only if `redisClient` is not null
> - Falls back to `undefined` (which triggers the built-in MemoryStore) when Redis is unavailable

---

#### 4.10 — Modify `server/src/config/queue.ts`

**What:** Make BullMQ job queue conditional — only initialize when Redis is available.
**Where:** [queue.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/config/queue.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview BullMQ Queue Configuration (Conditional)
 * @objective Provide a job queue for scheduled article publishing using BullMQ and Redis.
 * @risk If Redis is unavailable, BullMQ cannot function. The queue is disabled gracefully.
 * @relations Used by `content.service.ts` to schedule posts, and `server.ts` to wire completion events.
 * @logic
 * - Only initializes the queue and worker if REDIS_URL is configured.
 * - If Redis is not available, exports null values and logs a warning.
 * - Enables TLS for Upstash Redis connections (rediss:// URLs).
 */
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';
import prisma from '../db/prisma.js';
import { CacheService } from '../services/cache.service.js';

let publishQueue: Queue | null = null;
let publishWorker: Worker | null = null;

if (env.REDIS_URL) {
  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Enable TLS for Upstash Redis (rediss:// URLs)
    tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  // Create the publish queue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publishQueue = new Queue('publish-article', { connection: connection as any });

  // Create the worker that processes scheduled publishes
  publishWorker = new Worker(
    'publish-article',
    async (job) => {
      const { postId } = job.data;
      logger.info(`[Queue] Processing scheduled publish for post: ${postId}`);

      const post = await prisma.post.update({
        where: { id: postId, status: 'SCHEDULED' },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        include: {
          author: { select: { id: true, name: true } },
          category: true,
        },
      });

      // Invalidate the cache so the UI reflects the published status immediately
      await CacheService.delByPattern('posts:*');

      // Return for the completion handler
      return post;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { connection: connection as any }
  );

  publishWorker.on('completed', (job, result) => {
    logger.info(`[Queue] Post "${result.title}" published successfully`);
  });

  publishWorker.on('failed', (job, err) => {
    logger.error(`[Queue] Failed to publish post ${job?.data.postId}:`, err);
  });
} else {
  logger.warn('BullMQ disabled: REDIS_URL not configured. Scheduled publishing will not work.');
}

export { publishQueue, publishWorker };
```

> **What changed:**
> - `publishQueue` and `publishWorker` are now `null` by default
> - Only created when `env.REDIS_URL` is set
> - Added `tls` option for Upstash compatibility
> - Exports `null` when Redis is unavailable

---

#### 4.11 — Modify `server/src/services/content.service.ts`

**What:** Add null checks for `publishQueue` so scheduled publishing degrades gracefully.
**Where:** [content.service.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/services/content.service.ts)

**Find this line (line 306):**
```typescript
      await publishQueue.add('publish', { postId: post.id }, { delay, jobId: `publish-${post.id}` });
```

**Replace with:**
```typescript
      if (publishQueue) {
        await publishQueue.add('publish', { postId: post.id }, { delay, jobId: `publish-${post.id}` });
      } else {
        logger.warn(`[ContentService] BullMQ unavailable. Scheduled publish for post ${post.id} will not be queued.`);
      }
```

**Find these lines (lines 370-376):**
```typescript
    if (data.status === 'SCHEDULED' && updatedPost.scheduledAt) {
      const delay = updatedPost.scheduledAt.getTime() - Date.now();
      await publishQueue.add('publish', { postId: updatedPost.id }, { delay, jobId: `publish-${updatedPost.id}` });
    } else if (data.status && data.status !== 'SCHEDULED') {
      const job = await publishQueue.getJob(`publish-${updatedPost.id}`);
      if (job) await job.remove();
    }
```

**Replace with:**
```typescript
    if (publishQueue) {
      if (data.status === 'SCHEDULED' && updatedPost.scheduledAt) {
        const delay = updatedPost.scheduledAt.getTime() - Date.now();
        await publishQueue.add('publish', { postId: updatedPost.id }, { delay, jobId: `publish-${updatedPost.id}` });
      } else if (data.status && data.status !== 'SCHEDULED') {
        const job = await publishQueue.getJob(`publish-${updatedPost.id}`);
        if (job) await job.remove();
      }
    }
```

> **What changed:**
> - Wrapped all `publishQueue` calls with `if (publishQueue)` null checks
> - When BullMQ is unavailable, it logs a warning instead of crashing

---

#### 4.12 — Modify `server/src/server.ts`

**What:** Make Socket.io and BullMQ worker event wiring conditional.
**Where:** [server.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/server.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview Server Entry Point
 * @objective Start the Express HTTP server and listen for incoming connections on the configured port.
 * @risk Running the server on an occupied port throws an error (EADDRINUSE).
 * @relations Bootstraps the application defined in `app.ts` using configurations from `env.ts`.
 * @logic
 * - Imports the fully configured Express `app`.
 * - Calls `app.listen()` on `env.PORT`.
 * - Conditionally sets up Socket.io and BullMQ worker events.
 * - Logs confirmation to the console.
 */
import app from './app.js';
import { env } from './config/env.js';
import prisma from './db/prisma.js';
import { logger } from './config/logger.js';
import { redisClient } from './config/redis.js';
import { createServer } from 'http';
import { initSocketIO } from './config/socket.js';
import { publishWorker } from './config/queue.js';

async function startServer() {
  try {
    // 1. Ensure DB is connected before taking requests
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // Cleanup expired tokens in background
    prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] }
    }).then(res => logger.info(`Cleaned up ${res.count} expired/revoked tokens.`)).catch(err => logger.error('Cleanup tokens error', err));

    const httpServer = createServer(app);
    const io = initSocketIO(httpServer);

    // Wire BullMQ → Socket.io (only if BullMQ worker is available)
    if (publishWorker) {
      publishWorker.on('completed', (_job, result) => {
        logger.info(`[Server] Emitting article:published to clients for post: ${result.title}`);
        const payload = {
          id: result.id,
          title: result.title,
          slug: result.slug,
          author: result.author,
        };
        logger.info(`[Server] Emitting payload: ${JSON.stringify(payload)}`);
        io.emit('article:published', payload);
      });
    } else {
      logger.warn('[Server] BullMQ worker not available. Real-time publish events disabled.');
    }

    // 2. Capture the server instance
    const server = httpServer.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    app.get('/api/test-socket', (req, res) => {
      const payload = {
        id: 'test-id',
        title: 'Manually Triggered Post',
        slug: 'manually-triggered-post',
        author: { name: 'Test Author' }
      };
      logger.info(`[Server] Emitting manually triggered payload: ${JSON.stringify(payload)}`);
      io.emit('article:published', payload);
      res.send('Event emitted');
    });

    // 3. Handle server-level errors (like EADDRINUSE)
    server.on('error', (error) => {
      logger.error('Server encountered an error:', error);
      process.exit(1);
    });

    // 4. Implement Graceful Shutdown
    const shutdown = async () => {
      logger.info('Shutting down server gracefully...');
      setTimeout(() => {
        logger.error('Forcefully shutting down server after 10s timeout.');
        process.exit(1);
      }, 10000).unref();

      server.close(async () => {
        logger.info('Closed all incoming HTTP connections.');
        await prisma.$disconnect();
        logger.info('Disconnected from database.');
        if (publishWorker) {
          await publishWorker.close();
          logger.info('Closed BullMQ worker.');
        }
        if (redisClient) {
          await redisClient.quit();
          logger.info('Disconnected from Redis.');
        }
        logger.info('Exiting now.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();
```

> **What changed:**
> - Wrapped `publishWorker.on('completed', ...)` with `if (publishWorker)`
> - Wrapped `publishWorker.close()` and `redisClient.quit()` with null checks in shutdown handler
> - Added warning logs when features are unavailable

---

#### 4.13 — Modify `server/src/config/cors.ts`

**What:** Allow Vercel preview deployment URLs in addition to the main `CLIENT_URL`.
**Where:** [cors.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/config/cors.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview CORS Configuration
 * @objective Define the Cross-Origin Resource Sharing policy for the Express server.
 * @risk Misconfiguring CORS (e.g., wildcard origin in production) can lead to Cross-Site Request Forgery (CSRF) or unauthorized API access.
 * @relations Used in `app.ts` as an argument to the `cors()` middleware. Relies on `env.CLIENT_URL`.
 * @logic
 * - Allows requests specifically from the frontend `CLIENT_URL`.
 * - Also allows Vercel preview deployment URLs (*.vercel.app).
 * - Allows credentials (cookies) to be sent cross-origin.
 * - Restricts methods to standard REST verbs.
 */
import { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: [
    env.CLIENT_URL,
    /\.vercel\.app$/,  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

> **What changed:**
> - `origin` is now an array instead of a single string
> - Added regex `/\.vercel\.app$/` to allow any Vercel preview deployment URL (Vercel creates a unique URL for every deployment)

---

#### 4.14 — Modify `server/src/config/logger.ts`

**What:** Remove file-based logging (Vercel serverless functions don't have a persistent filesystem).
**Where:** [logger.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/server/src/config/logger.ts)

**Replace the entire file with:**
```typescript
/**
 * @module config/logger
 * @description Centralized Winston Logger setup.
 * @relations Used globally across the application for structured logging. Integrated closely with `error.middleware.ts` and `performance.middleware.ts`.
 * @logic
 * - Formats logs as JSON in production for log aggregators (Vercel captures console output).
 * - Formats logs dynamically with color for local development.
 * - In production/serverless, logs only to console (no file transport — serverless has no persistent filesystem).
 * - In development, also logs to files (`logs/error.log`, `logs/combined.log`).
 */
import winston from 'winston';
import { env } from './env.js';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message} `;
    if (metadata.requestId) {
      msg = `${timestamp} [${level}] [${metadata.requestId}] : ${message} `;
    }
    
    // Don't print empty objects
    const metaString = Object.keys(metadata).length > 0 && !metadata.requestId 
      ? JSON.stringify(metadata) 
      : '';
      
    return msg + metaString;
  })
);

const transports: winston.transport[] = [
  // Always log to console (Vercel captures this)
  new winston.transports.Console({
    format: env.NODE_ENV === 'production'
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(winston.format.colorize(), logFormat),
  }),
];

// In development, also log to files
if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});
```

> **What changed:**
> - File transports (`logs/error.log`, `logs/combined.log`) are only added in development
> - In production (Vercel), logs go only to console — Vercel automatically captures and displays console output in its dashboard under "Function Logs"

---

#### 4.15 — Modify `client/vite.config.ts`

**What:** Simplify for Vercel static deployment (remove SSR config and socket.io proxy).
**Where:** [vite.config.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/client/vite.config.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview Vite Configuration
 * @objective Configure the frontend build tool, including React support and Progressive Web App (PWA) generation.
 * @risk Misconfiguring caching strategies in `workbox` can result in users seeing stale content or breaking offline mode.
 * @relations Used by `npm run dev` and `npm run build`. Generates the `dist/` output.
 * @logic
 * - `react()`: Enables JSX transformation and Fast Refresh.
 * - `VitePWA()`: Generates the `manifest.json` and configures Workbox service workers.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Execora Blog Platform',
        short_name: 'Execora',
        description: 'A modern full-stack blog platform.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image' ||
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

> **What changed:**
> - Removed the `ssr` config block (not needed for Vercel SPA deployment)
> - Removed the `/socket.io` proxy (Socket.io is disabled in serverless)

---

#### 4.16 — Modify `client/package.json`

**What:** Simplify build scripts for Vercel's SPA (Single Page App) deployment.
**Where:** [client/package.json](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/client/package.json)

**Find these lines (lines 6-11):**
```json
  "scripts": {
    "dev": "tsx server.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.tsx",
    "preview": "cross-env NODE_ENV=production tsx server.ts"
  },
```

**Replace with:**
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
```

> **What changed:**
> - `dev` now just runs `vite` directly (no more custom SSR server)
> - `build` runs a simple `vite build` (outputs to `dist/` by default)
> - `preview` uses Vite's built-in preview server
> - Removed SSR build step since we're deploying as a SPA on Vercel

---

#### 4.17 — Modify `client/src/hooks/useSocket.ts`

**What:** Make Socket.io connection conditional — disable in production/serverless.
**Where:** [useSocket.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/client/src/hooks/useSocket.ts)

**Replace the entire file with:**
```typescript
/**
 * @fileoverview Socket.io Hook (Conditional)
 * @objective Provide real-time article publish notifications via Socket.io in development.
 * @risk Socket.io is disabled in production/serverless environments (Vercel does not support WebSockets).
 * @relations Used in App.tsx to listen for article:published events.
 * @logic
 * - Only connects to Socket.io in development mode.
 * - In production, this hook is a no-op (does nothing).
 */
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function useSocket() {
  useEffect(() => {
    // Socket.io is only available in development (Vercel serverless does not support WebSockets)
    if (!import.meta.env.DEV) return;

    // Dynamically import socket.io-client only in development
    import('socket.io-client').then(({ io }) => {
      const SOCKET_URL = 'http://localhost:3000';
      const socket = io(SOCKET_URL, { path: '/socket.io' });

      const handleArticlePublished = (post: { id: string; title: string; slug: string; author: { name: string } }) => {
        console.log('[useSocket] Received article:published event from server!', post);
        toast.success(`New article published: "${post.title}"`);
      };

      socket.on('article:published', handleArticlePublished);

      const handleTestEvent = (data: any) => {
        console.log('[useSocket] Received test:event from server!', data);
        toast.success('Socket connected successfully!');
      };
      socket.on('test:event', handleTestEvent);

      // Cleanup on unmount
      return () => {
        socket.off('article:published', handleArticlePublished);
        socket.off('test:event', handleTestEvent);
        socket.disconnect();
      };
    });
  }, []);
}
```

> **What changed:**
> - Added `if (!import.meta.env.DEV) return;` — Socket.io is only used in development
> - Dynamically imports `socket.io-client` to avoid bundling it in production
> - In production (Vercel), this hook does nothing — the app works fine without real-time notifications

---

#### 4.18 — Modify `client/.env.production`

**What:** Update production environment variables for Vercel deployment.
**Where:** [.env.production](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/client/.env.production)

**Replace the entire file with:**
```env
# ==========================================
# Frontend Application Settings (Production)
# ==========================================
# In production on Vercel, the API is served from the same domain via rewrites.
# Using a relative path "/api" means requests go to https://YOUR-APP.vercel.app/api/*
# which Vercel rewrites to the serverless function.
VITE_API_URL="/api"
```

> **What changed:**
> - Changed `VITE_API_URL` from `http://localhost:3000/api` to `/api` (relative path)
> - On Vercel, `/api` requests are handled by the serverless function on the same domain — no CORS issues
> - Removed `VITE_GOOGLE_CLIENT_ID` from this file — it will be set securely in Vercel's environment variables dashboard instead

---

#### 4.19 — Modify `.gitignore` (Project Root)

**What:** Ensure all sensitive files and build artifacts are excluded from Git.
**Where:** [.gitignore](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/07%20Building%20and%20Deploying%20Severless%20Applications/blog-app-1.5-serverless/.gitignore)

**Replace the entire file with:**
```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment files (NEVER commit secrets!)
.env
.env.local
.env.production.local
server/.env
client/.env.local

# Logs
*.log
logs/

# OS files
.DS_Store

# IDE
.vscode/

# Vercel
.vercel
```

> **What changed:**
> - Added `server/.env` and `client/.env.local` to ensure secret files are never committed
> - Added `.vercel` directory (Vercel CLI creates this locally)
> - Added `logs/` directory

---

### Phase 5: Run Prisma Migrations Against Supabase

**Goal:** Create your database tables on Supabase by running your existing migration files.

#### Step 5.1 — Set Up Local Environment for Migration

1. Open your terminal
2. Navigate to the **server** directory:
   ```bash
   cd "/Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module 5 - Advanced Software Development /07 Building and Deploying Severless Applications/blog-app-1.5-serverless/server"
   ```

3. Create (or edit) the `server/.env` file with your Supabase connection strings:
   ```bash
   # Open the file in your editor, or create it:
   nano .env
   ```

4. Paste the following content into `server/.env`, **replacing the placeholder values** with your real Supabase URLs from Phase 1:
   ```env
   NODE_ENV="development"
   PORT=3000
   CLIENT_URL="http://localhost:5173"
   SERVER_URL="http://localhost:3000"

   # ⬇️ PASTE YOUR SUPABASE URLs HERE ⬇️
   DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

   JWT_ACCESS_SECRET="your-32-character-minimum-access-secret-key-here"
   JWT_REFRESH_SECRET="your-32-character-minimum-refresh-secret-key-here"

   # ⬇️ PASTE YOUR UPSTASH REDIS URL HERE ⬇️
   REDIS_URL="rediss://default:YOUR_UPSTASH_PASSWORD@your-endpoint.upstash.io:6379"
   CACHE_TTL=300

   # Optional: Fill these in if you have them
   CLOUDINARY_CLOUD_NAME=""
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER=""
   SMTP_PASS=""
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
   ```

5. Save and close the file (in nano: `Ctrl+O`, `Enter`, `Ctrl+X`)

#### Step 5.2 — Generate the Prisma Client

```bash
npx prisma generate
```

You should see output like:
```
✔ Generated Prisma Client
```

#### Step 5.3 — Run the Migration

```bash
npx prisma migrate deploy
```

This command reads all your existing migration files from `prisma/migrations/` and applies them to the Supabase database.

You should see output like:
```
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-0-ap-southeast-1.pooler.supabase.com:5432"

X migrations found in prisma/migrations
...

All migrations have been successfully applied.
```

> [!CAUTION]
> If you see an error like `Error: P1001: Can't reach database server`:
> - Double-check your `DIRECT_URL` (make sure port is `5432`, not `6543`)
> - Make sure the password is correct (no extra spaces or quotes)
> - Check if your network/firewall is blocking the connection

#### Step 5.4 — Verify the Migration (Optional)

```bash
npx prisma studio
```

This opens a browser window at `http://localhost:5555` where you can see all your tables (User, Post, Category, Tag, Comment, Like, RefreshToken, etc.) on Supabase.

#### Step 5.5 — Seed the Database (Optional)

If you want to populate the database with sample data:

```bash
npx tsx prisma/seed.ts
```

---

### Phase 6: Deploy to Vercel

**Goal:** Deploy the full-stack app to Vercel and configure all environment variables securely.

#### Step 6.1 — Commit and Push Your Code Changes

After making all the code changes in Phase 4, commit and push them:

```bash
# Navigate to the project root
cd "/Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module 5 - Advanced Software Development /07 Building and Deploying Severless Applications/blog-app-1.5-serverless"

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Adapt codebase for Vercel serverless deployment with Supabase and Upstash"

# Push to GitHub
git push
```

#### Step 6.2 — Create a Vercel Project

1. Go to **[vercel.com](https://vercel.com)** and log in
2. Click **"Add New..."** → **"Project"**
3. You should see a list of your GitHub repositories. Find **`blog-app-serverless`** and click **"Import"**
4. You'll see a **"Configure Project"** page. Fill in:

   | Setting | Value |
   |---------|-------|
   | **Project Name** | `blog-app-serverless` (or any name) |
   | **Framework Preset** | `Vite` |
   | **Root Directory** | Click **"Edit"** → type `client` → click **"Continue"** |
   | **Build Command** | Override to: `cd .. && npm run build` |
   | **Output Directory** | Override to: `dist` |
   | **Install Command** | Override to: `cd .. && npm install` |

   > **Why `cd ..`?** Because we set the Root Directory to `client`, Vercel starts in the `client/` folder. We need to go up one level (`cd ..`) to run commands from the project root where `package.json` has the workspaces configured.

#### Step 6.3 — Add Environment Variables

**This is the most critical security step.** On the same "Configure Project" page, scroll down to **"Environment Variables"**.

Click to expand it, then add **each variable one by one** by typing the name, pasting the value, and clicking **"Add"**:

| # | Variable Name | Value to Enter | Notes |
|---|--------------|----------------|-------|
| 1 | `NODE_ENV` | `production` | |
| 2 | `DATABASE_URL` | `postgresql://postgres.XXX:PASSWORD@...pooler.supabase.com:6543/postgres` | Your Transaction mode URL from Phase 1 |
| 3 | `DIRECT_URL` | `postgresql://postgres.XXX:PASSWORD@...pooler.supabase.com:5432/postgres` | Your Session mode URL from Phase 1 |
| 4 | `JWT_ACCESS_SECRET` | *(generate with `openssl rand -base64 32` in terminal)* | Must be 32+ characters |
| 5 | `JWT_REFRESH_SECRET` | *(generate a DIFFERENT one with `openssl rand -base64 32`)* | Must be 32+ characters, DIFFERENT from #4 |
| 6 | `CLIENT_URL` | `https://blog-app-serverless.vercel.app` | ⚠️ You'll update this after first deploy if the URL is different |
| 7 | `SERVER_URL` | `https://blog-app-serverless.vercel.app` | Same as CLIENT_URL |
| 8 | `REDIS_URL` | `rediss://default:PASSWORD@endpoint.upstash.io:6379` | Your Upstash Redis URL from Phase 2 |
| 9 | `CACHE_TTL` | `300` | Cache duration in seconds |
| 10 | `CLOUDINARY_CLOUD_NAME` | *(your Cloudinary cloud name)* | From Cloudinary dashboard |
| 11 | `CLOUDINARY_API_KEY` | *(your Cloudinary API key)* | From Cloudinary dashboard |
| 12 | `CLOUDINARY_API_SECRET` | *(your Cloudinary API secret)* | From Cloudinary dashboard |
| 13 | `SMTP_HOST` | `smtp.gmail.com` | |
| 14 | `SMTP_PORT` | `587` | |
| 15 | `SMTP_USER` | *(your Gmail address)* | |
| 16 | `SMTP_PASS` | *(your Gmail app password)* | Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| 17 | `GOOGLE_CLIENT_ID` | *(your Google OAuth client ID)* | From Google Cloud Console |
| 18 | `GOOGLE_CLIENT_SECRET` | *(your Google OAuth client secret)* | From Google Cloud Console |
| 19 | `GOOGLE_CALLBACK_URL` | `https://blog-app-serverless.vercel.app/api/auth/google/callback` | ⚠️ Update domain if different |
| 20 | `VITE_API_URL` | `/api` | |
| 21 | `VITE_GOOGLE_CLIENT_ID` | *(same as GOOGLE_CLIENT_ID)* | This one is for the frontend |

> [!TIP]
> **How to generate JWT secrets on macOS:**
> Open Terminal and run this command twice (once for each secret):
> ```bash
> openssl rand -base64 32
> ```
> Each run produces a random string like `aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u=`. Copy and paste it as the value.

> [!CAUTION]
> **Security Rules:**
> - ✅ **ALWAYS** add secrets through Vercel's dashboard (they're encrypted at rest)
> - ❌ **NEVER** put secrets in `vercel.json` (it's committed to Git!)
> - ❌ **NEVER** commit `.env` files to Git (they're in `.gitignore`)
> - ✅ Use **DIFFERENT** JWT secrets for production vs. development
> - ✅ Vercel encrypts all environment variables and never exposes them in logs

#### Step 6.4 — Deploy!

1. After adding all environment variables, click **"Deploy"**
2. Vercel will:
   - Clone your repo
   - Run `cd .. && npm install` (installs all dependencies)
   - Run `cd .. && npm run build` (builds client and server)
   - Deploy the built files
3. Wait for the build to complete (usually 1-3 minutes)
4. When done, you'll see a **"Congratulations!"** page with your deployment URL

> [!NOTE]
> If the build **fails**, click on the deployment to see the build logs. Common issues:
> - **Missing environment variable** → Check the "Environment Variables" section
> - **TypeScript error** → The code has a type error that needs fixing
> - **Module not found** → A dependency is missing from `package.json`

#### Step 6.5 — Note Your Production URL

After deployment, Vercel gives you a URL like:
```
https://blog-app-serverless.vercel.app
```
or
```
https://blog-app-serverless-your-username.vercel.app
```

**⚠️ If the URL is different from what you entered for `CLIENT_URL` and `SERVER_URL`:**
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Update `CLIENT_URL` to match the actual URL
3. Update `SERVER_URL` to match the actual URL
4. Update `GOOGLE_CALLBACK_URL` to: `https://YOUR-ACTUAL-URL.vercel.app/api/auth/google/callback`
5. Click **"Save"**
6. Go to **Deployments** → click the **"..."** menu on the latest deployment → **"Redeploy"**

#### Step 6.6 — Update Google OAuth Redirect URI

1. Go to **[Google Cloud Console](https://console.cloud.google.com/apis/credentials)**
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized JavaScript origins"**, click **"Add URI"** and add:
   ```
   https://YOUR-APP.vercel.app
   ```
4. Under **"Authorized redirect URIs"**, click **"Add URI"** and add:
   ```
   https://YOUR-APP.vercel.app/api/auth/google/callback
   ```
5. Click **"Save"**

> [!NOTE]
> Google OAuth changes can take a few minutes to propagate. If Google login doesn't work immediately, wait 5 minutes and try again.

---

### Phase 7: Verify the Deployment

**Goal:** Confirm everything works in production.

#### Verification Checklist

Open your deployed app URL in the browser and test each feature:

| # | Test | How to Verify | Expected Result |
|---|------|---------------|-----------------|
| 1 | **App loads** | Visit `https://YOUR-APP.vercel.app` | Homepage renders with your blog content |
| 2 | **API health** | Visit `https://YOUR-APP.vercel.app/api/health` | JSON response: `{"status":"ok","database":"connected",...}` |
| 3 | **Database works** | Register a new user account | Registration succeeds, you can log in |
| 4 | **Auth works** | Log in with email/password | Dashboard is accessible |
| 5 | **Google OAuth** | Click "Sign in with Google" | Google login popup appears and works |
| 6 | **Image upload** | Create a post with a cover image | Image uploads to Cloudinary successfully |
| 7 | **Create post** | Create and publish a blog post | Post appears on the homepage |
| 8 | **Scheduled publish** | Create a post with "Scheduled" status | Post status shows as SCHEDULED (publishes at scheduled time via BullMQ) |
| 9 | **Env vars secure** | Go to Vercel Dashboard → Settings → Environment Variables | All values show as "Encrypted" |

#### Debugging Common Issues

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| **500 error on API calls** | Missing environment variable or code error | Go to Vercel Dashboard → **Deployments** → click your deployment → **"Functions"** tab → check the logs |
| **Database connection error** | Wrong `DATABASE_URL` or wrong port | Verify `DATABASE_URL` uses port **6543** (not 5432). The `5432` port is only for `DIRECT_URL` |
| **CORS error in browser console** | `CLIENT_URL` doesn't match your actual Vercel URL | Update `CLIENT_URL` in Vercel env vars to match exactly (including `https://`) |
| **Google OAuth "redirect_uri_mismatch"** | Redirect URI not added to Google Console | Add `https://YOUR-APP.vercel.app/api/auth/google/callback` to Google Cloud Console → OAuth → Authorized redirect URIs |
| **Build fails: "Cannot find module"** | Dependencies not installed at root level | Make sure install command is `cd .. && npm install` |
| **API returns 404 for all routes** | `vercel.json` rewrites not working | Verify `vercel.json` exists in project root and the `rewrites` section is correct |
| **Scheduled post never publishes** | BullMQ/Redis not connected | Check that `REDIS_URL` is set correctly in Vercel env vars. Verify in Upstash dashboard that commands are being received |

#### How to Check Vercel Logs

1. Go to [vercel.com](https://vercel.com) → Your project
2. Click **"Deployments"** in the top nav
3. Click on the latest deployment
4. Click **"Functions"** tab
5. You'll see logs from your serverless functions — any errors will appear here

---

## Complete Summary of All Changes

| # | Action | File | Purpose |
|---|--------|------|---------|
| 1 | **[NEW]** | `vercel.json` | Vercel deployment configuration |
| 2 | **[NEW]** | `api/index.ts` | Serverless function entry point |
| 3 | **[MODIFY]** | `server/prisma/schema.prisma` | Add `url` and `directUrl` for Supabase |
| 4 | **[MODIFY]** | `server/prisma.config.ts` | Use `DIRECT_URL` for migrations |
| 5 | **[MODIFY]** | `server/src/config/env.ts` | Add `DIRECT_URL`, make `REDIS_URL` optional |
| 6 | **[MODIFY]** | `server/src/config/redis.ts` | Conditional Redis with TLS support |
| 7 | **[MODIFY]** | `server/src/services/cache.service.ts` | Null checks for `redisClient` |
| 8 | **[MODIFY]** | `server/src/middleware/rateLimiter.middleware.ts` | Conditional RedisStore |
| 9 | **[MODIFY]** | `server/src/routes/upload.routes.ts` | Conditional RedisStore |
| 10 | **[MODIFY]** | `server/src/config/queue.ts` | Conditional BullMQ with TLS |
| 11 | **[MODIFY]** | `server/src/services/content.service.ts` | Null checks for `publishQueue` |
| 12 | **[MODIFY]** | `server/src/server.ts` | Conditional Socket.io/BullMQ/Redis |
| 13 | **[MODIFY]** | `server/src/config/cors.ts` | Allow Vercel preview URLs |
| 14 | **[MODIFY]** | `server/src/config/logger.ts` | Console-only logging in production |
| 15 | **[MODIFY]** | `client/vite.config.ts` | Remove SSR config |
| 16 | **[MODIFY]** | `client/package.json` | Simplify build scripts |
| 17 | **[MODIFY]** | `client/src/hooks/useSocket.ts` | Disable Socket.io in production |
| 18 | **[MODIFY]** | `client/.env.production` | Update API URL for Vercel |
| 19 | **[MODIFY]** | `.gitignore` | Exclude all sensitive files |

---

## Architecture Diagram

```mermaid
graph TB
    subgraph Before["Before: Local Docker Setup"]
        LC["Client<br/>localhost:5173"] --> LS["Server<br/>localhost:3000"]
        LS --> LP[("PostgreSQL<br/>Docker :5434")]
        LS --> LR[("Redis<br/>Docker :6379")]
        LS -.->|"Socket.io"| LC
    end

    subgraph After["After: Vercel + Supabase + Upstash"]
        VC["Client (SPA)<br/>Vercel CDN"] -->|"/api/*"| VF["Express API<br/>Vercel Serverless Function"]
        VF --> SP[("PostgreSQL<br/>Supabase :6543")]
        VF --> UR[("Redis<br/>Upstash :6379")]
        VF -.->|"Prisma Migrations<br/>(DIRECT_URL :5432)"| SP
    end

    Before -.->|"Deploy"| After
```
