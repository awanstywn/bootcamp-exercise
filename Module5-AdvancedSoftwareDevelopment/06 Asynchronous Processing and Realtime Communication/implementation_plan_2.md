# Implementation Plan 2: Article Scheduling & Realtime Notifications

> Add scheduled article publishing via BullMQ (Redis-backed job queue) and realtime push notifications via Socket.io to `blog-app-1.4`.

> [!IMPORTANT]
> **Prerequisite**: This plan depends on **Plan 1** being completed first. It relies on the Redis client (`config/redis.ts`), Winston logger (`config/logger.ts`), and the `asyncHandler` utility created in Plan 1.

---

## Current State Summary

| Area | Current (after Plan 1) | After Plan 2 |
|---|---|---|
| **Post Status** | `DRAFT`, `PUBLISHED`, `ARCHIVED` | + `SCHEDULED` |
| **Post Fields** | No scheduling fields | + `scheduledAt`, `publishedAt` |
| **Background Jobs** | None | BullMQ worker auto-publishes at scheduled time |
| **Realtime** | None (HTTP polling only) | Socket.io push notifications |
| **Frontend UX** | Manual refresh to see new posts | Live toast: "New article published: {title}!" |

---

## User Review Required

> [!WARNING]
> **Database migration required** — This plan adds an enum value (`SCHEDULED`) and two new columns (`scheduledAt`, `publishedAt`) to the `Post` model. You'll need to run `npx prisma migrate dev`.

> [!IMPORTANT]
> **New npm dependencies** — `bullmq` and `socket.io` (server-side), `socket.io-client` (client-side).

---

## Open Questions

> [!IMPORTANT]
> 1. **Should `publishedAt` be backfilled?** Currently, posts that are already `PUBLISHED` have no `publishedAt` value. Should we write a migration script to set `publishedAt = createdAt` for existing published posts?
> 2. **Who can schedule?** Should only `AUTHOR` and `ADMIN` roles be allowed to schedule, or should all authenticated users with write access be able to? (The plan assumes `AUTHOR` + `ADMIN`.)
> 3. **Socket.io authentication** — Should we require a valid JWT for Socket.io connections (only authenticated users get realtime events), or should it be open to all visitors?

---

## Proposed Changes

### Step 2.1 — Install New Dependencies

```bash
# Server-side (BullMQ for job queue, Socket.io for realtime)
npm install bullmq socket.io -w server

# Client-side (Socket.io client)
npm install socket.io-client -w client
```

---

### Step 2.2 — Prisma Schema Changes

#### [MODIFY] [schema.prisma](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/prisma/schema.prisma)

Add `SCHEDULED` to `PostStatus` enum:
```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED   // NEW
}
```

Add scheduling fields to `Post` model:
```prisma
model Post {
  // ... existing fields ...
  scheduledAt   DateTime?   // When to auto-publish
  publishedAt   DateTime?   // When it was actually published
  // ...

  @@index([status, scheduledAt])  // NEW: for the worker query
}
```

Then run:
```bash
cd server
npx prisma migrate dev --name add_scheduling
```

---

### Step 2.3 — Update Shared Types (DTO)

#### [MODIFY] shared types file
Add `SCHEDULED` to the client-side `PostStatus` enum/type and add `scheduledAt`/`publishedAt` to the Post DTO, per the AGENTS.md DTO pattern.

---

### Step 2.4 — BullMQ Queue & Worker

#### [NEW] [queue.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/config/queue.ts)

```typescript
import { Queue, Worker } from 'bullmq';
import { redisClient } from './redis.js';
import { logger } from './logger.js';
import prisma from '../db/prisma.js';

// Create the publish queue
export const publishQueue = new Queue('publish-article', {
  connection: redisClient.duplicate(),
});

// Create the worker that processes scheduled publishes
export const publishWorker = new Worker(
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

    // Emit Socket.io event (will be wired in Step 2.5)
    return post; // Return for the completion handler
  },
  { connection: redisClient.duplicate() }
);

publishWorker.on('completed', (job, result) => {
  logger.info(`[Queue] Post "${result.title}" published successfully`);
});

publishWorker.on('failed', (job, err) => {
  logger.error(`[Queue] Failed to publish post ${job?.data.postId}:`, err);
});
```

**Key design decisions:**
- Uses `redisClient.duplicate()` — BullMQ requires its own connection, not a shared one.
- Worker checks `status: 'SCHEDULED'` to prevent double-publishing.
- Returns the post data so the completion handler can emit Socket.io events.

---

### Step 2.5 — Socket.io Setup

#### [NEW] [socket.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/config/socket.ts)

```typescript
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env.js';
import { logger } from './logger.js';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.debug(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
```

---

### Step 2.6 — Wire Socket.io into Server

#### [MODIFY] [server.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/server.ts)

- Create `http.createServer(app)` instead of `app.listen()` directly.
- Initialize Socket.io with `initSocketIO(httpServer)`.
- Import and start the BullMQ worker.
- Wire the worker's `completed` event to emit `io.emit('article:published', postData)`.
- Add worker graceful shutdown.

```typescript
import { createServer } from 'http';
import { initSocketIO, getIO } from './config/socket.js';
import { publishWorker } from './config/queue.js';

const httpServer = createServer(app);
const io = initSocketIO(httpServer);

// Wire BullMQ → Socket.io
publishWorker.on('completed', (_job, result) => {
  io.emit('article:published', {
    id: result.id,
    title: result.title,
    slug: result.slug,
    author: result.author,
  });
});

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
```

---

### Step 2.7 — Update ContentService for Scheduling

#### [MODIFY] [content.service.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/services/content.service.ts)

Update `PostInputData` interface:
```typescript
export interface PostInputData {
  // ... existing fields ...
  scheduledAt?: string;   // ISO date string for scheduling
}
```

Update `createPost`:
```typescript
// If status is SCHEDULED, validate scheduledAt and queue the job
if (data.status === 'SCHEDULED') {
  if (!data.scheduledAt) throw new BadRequestError('scheduledAt is required for scheduled posts');

  const scheduledDate = new Date(data.scheduledAt);
  if (scheduledDate <= new Date()) throw new BadRequestError('scheduledAt must be in the future');

  // Create the post first
  const post = await prisma.post.create({ ... , data: { ..., scheduledAt: scheduledDate } });

  // Add a delayed job to BullMQ
  const delay = scheduledDate.getTime() - Date.now();
  await publishQueue.add('publish', { postId: post.id }, { delay });

  return { data: post, source: 'DB' };
}
```

Update `updatePost`:
- If status changes to `SCHEDULED`, add/update the queue job.
- If status changes away from `SCHEDULED`, remove the queued job.
- When manually publishing, set `publishedAt = new Date()`.

---

### Step 2.8 — Frontend Socket.io Client

#### [NEW] Client Socket Hook (e.g., `client/src/hooks/useSocket.ts`)

```typescript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'your-toast-library'; // e.g. sonner, react-hot-toast

const socket = io(import.meta.env.VITE_API_URL);

export function useSocket() {
  useEffect(() => {
    socket.on('article:published', (post) => {
      toast.success(`New article published: "${post.title}"`);
      // Optionally trigger refetch of posts list
    });

    return () => {
      socket.off('article:published');
    };
  }, []);

  return socket;
}
```

#### [MODIFY] Root layout or App component
- Call `useSocket()` at the top level so it listens globally.

---

### Step 2.9 — Content Validator Update

#### [MODIFY] Content validators (e.g., `server/src/validators/`)
- Add `scheduledAt` as an optional ISO date string field.
- Validate that `scheduledAt` is present when `status === 'SCHEDULED'`.

---

## Files Summary

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `server/prisma/schema.prisma` | Add `SCHEDULED` enum, scheduling fields |
| NEW | `server/src/config/queue.ts` | BullMQ queue + worker |
| NEW | `server/src/config/socket.ts` | Socket.io server setup |
| MODIFY | `server/src/server.ts` | Wire HTTP server + Socket.io + worker |
| MODIFY | `server/src/services/content.service.ts` | Scheduling logic + queue integration |
| MODIFY | Shared types file | Add `SCHEDULED` status to DTO |
| MODIFY | Content validators | Add `scheduledAt` validation |
| NEW | `client/src/hooks/useSocket.ts` | Socket.io client hook |
| MODIFY | Client root/layout | Register socket listener |
| MIGRATE | Prisma migration | `add_scheduling` |

---

## Verification Plan

### Automated Tests
```bash
# 1. Run the Prisma migration
cd server && npx prisma migrate dev --name add_scheduling

# 2. Build to catch TypeScript errors
npm run build -w server

# 3. Start all Docker services
docker compose up -d
```

### Manual Verification

1. **Schedule a post**: 
   - Create a post with `status: "SCHEDULED"` and `scheduledAt` set to 1 minute in the future.
   - Verify the post appears with status `SCHEDULED` in the admin view.
   - Wait for the scheduled time → verify the post status changes to `PUBLISHED`.

2. **Realtime notification**:
   - Open the React frontend in a browser.
   - Schedule a post for 1 minute ahead.
   - When the post publishes, a toast notification should appear: *"New article published: {title}!"*.

3. **Socket.io connection**:
   - Open browser DevTools → Network → WS tab.
   - Verify a WebSocket connection to the server is established.

4. **Edge cases**:
   - Try scheduling with a past date → should get `400 Bad Request`.
   - Try scheduling without `scheduledAt` → should get `400 Bad Request`.
   - Manually publish a scheduled post → should cancel the queued job and publish immediately.
