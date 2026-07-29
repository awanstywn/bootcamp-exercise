# Implementation Plan 1: Performance, Caching, Logging & Error Handling

> Upgrade `blog-app-1.4` server with Winston logging, Redis caching (via `ioredis`), improved error handling, request ID tracking, performance middleware, and `asyncHandler` refactoring.

---

## Current State Summary

| Area | Current | After Plan 1 |
|---|---|---|
| **Logging** | `console.log` / `console.error` | Winston (file + console, request IDs) |
| **Caching** | None | Redis via `ioredis` + `CacheService` |
| **Error Handling** | Basic `AppError` (statusCode + message) | Enhanced `AppError` with `errorCode`, `isOperational`, `details` |
| **Error Middleware** | Simple catch-all | Normalized Zod/Prisma → custom error classes |
| **Controllers** | Manual `try/catch → next(error)` | `asyncHandler` wrapper (no more try-catch) |
| **Observability** | None | Request ID header, response time logging, data-source tracking |

---

## User Review Required

> [!IMPORTANT]
> **Redis dependency** — This plan requires a running Redis instance. We will add a `redis` service to [docker-compose.yml](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/docker-compose.yml). Make sure Docker is available on your machine.

> [!WARNING]
> **Breaking change in error response shape** — The error response JSON will change from `{ error: "message" }` to `{ success: false, error: { code, message, details } }`. The React frontend may need to update its error-handling logic accordingly.

---

## Proposed Changes

### Step 1.1 — Install New Dependencies

Run at the **project root** (per AGENTS.md — never install inside `server/`):

```bash
npm install winston ioredis -w server
```

#### [MODIFY] [package.json](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/package.json)
- Adds `winston` and `ioredis` to `dependencies`.

---

### Step 1.2 — Environment Variables

#### [MODIFY] [.env](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/.env) & [.env.example](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/.env.example)
Append:
```env
# Redis & Caching
REDIS_URL="redis://localhost:6379"
CACHE_TTL=300
```

#### [MODIFY] [env.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/config/env.ts)
Add to `envSchema`:
```typescript
REDIS_URL: z.string().url().default('redis://localhost:6379'),
CACHE_TTL: z.coerce.number().default(300),
```

---

### Step 1.3 — Add Redis Service to Docker Compose

#### [MODIFY] [docker-compose.yml](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/docker-compose.yml)
Add a `redis` service:
```yaml
redis:
  image: redis:alpine
  container_name: blogapp_redis
  ports:
    - "6379:6379"
  restart: unless-stopped
```
Update the `app` service `depends_on` to include `redis`.

---

### Step 1.4 — Winston Logger

#### [NEW] [logger.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/config/logger.ts)
- Creates a Winston logger singleton.
- **Production**: JSON format → `logs/error.log` + `logs/combined.log`.
- **Development**: Colorized console output with request ID support.
- Log level: `debug` in development, `info` in production.

---

### Step 1.5 — Redis Client

#### [NEW] [redis.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/config/redis.ts)
- Creates an `ioredis` singleton with retry strategy.
- Logs connection/error events via Winston.
- `maxRetriesPerRequest: 3` — app won't crash if Redis is temporarily unavailable.

---

### Step 1.6 — Cache Service

#### [NEW] [cache.service.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/services/cache.service.ts)
- `CacheService.get<T>(key)` — JSON parse from Redis, returns `null` on miss/error (fail-open).
- `CacheService.set(key, data, ttl?)` — `SETEX` with configurable TTL (default from `CACHE_TTL`).
- `CacheService.del(key)` — Delete a specific key.
- `CacheService.delByPattern(pattern)` — Delete keys matching a glob (e.g. `posts:*`).

---

### Step 1.7 — Enhanced Error Classes

#### [MODIFY] [errors.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/utils/errors.ts)
**Move `AppError` from `error.middleware.ts` into `errors.ts`** and enhance it with:
- `errorCode: string` (e.g. `ERR_NOT_FOUND`)
- `isOperational: boolean` (expected error vs. bug)
- `details?: any` (validation details, etc.)

Add new error classes: `ConflictError`, `ValidationError`, `DatabaseError`, `ExternalServiceError`.

Update existing classes (`NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `BadRequestError`) to use the new base class and import from the same file (no more circular import from `error.middleware.ts`).

---

### Step 1.8 — Centralized Error Middleware

#### [MODIFY] [error.middleware.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/middleware/error.middleware.ts)
- **Remove** `AppError` class definition (it now lives in `errors.ts`).
- **Import** `AppError` and all subclasses from `../utils/errors.js`.
- **Import** `logger` for structured logging instead of `console.error`.
- Normalize `ZodError` → `ValidationError`, `PrismaClientKnownRequestError` → `ConflictError`/`NotFoundError`/`DatabaseError`.
- Return structured JSON: `{ success: false, error: { code, message, details, stack? } }`.
- Log operational errors as `warn`, non-operational as `error`.

---

### Step 1.9 — Request ID & Performance Middlewares

#### [MODIFY] [express.d.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/types/express.d.ts)
Add `id?: string` to the Express `Request` interface.

#### [NEW] [requestId.middleware.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/middleware/requestId.middleware.ts)
- Generates a `crypto.randomUUID()`.
- Attaches to `req.id` and sets `X-Request-Id` response header.

#### [NEW] [performance.middleware.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/middleware/performance.middleware.ts)
- Records `process.hrtime()` at request start.
- On `res.finish`, logs `[Performance] METHOD /path - Xms (CACHE|DB)` via Winston.

---

### Step 1.10 — Wire Up New Middlewares in App

#### [MODIFY] [app.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/app.ts)
- Import and register `requestIdMiddleware` and `performanceMiddleware` after `express.urlencoded()`.
- Update import of `errorMiddleware` (no longer exports `AppError`).

---

### Step 1.11 — `asyncHandler` Utility

#### [NEW] [asyncHandler.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/utils/asyncHandler.ts)
- Wraps async route handlers: `Promise.resolve(fn(req, res, next)).catch(next)`.
- Eliminates all manual `try/catch → next(error)` blocks in controllers.

---

### Step 1.12 — Refactor All Controllers

All 7 controllers will be refactored from the manual `try/catch` pattern to use `asyncHandler`:

#### [MODIFY] [content.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/content.controller.ts)
- 9 methods → `asyncHandler` pattern.
- `getPosts` and `getPostBySlug` will set `res.locals.dataSource` from the service return.

#### [MODIFY] [auth.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/auth.controller.ts)
- 8 methods → `asyncHandler` pattern.

#### [MODIFY] [engagement.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/engagement.controller.ts)
- 5 methods → `asyncHandler` pattern.

#### [MODIFY] [admin.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/admin.controller.ts)
- 5 methods → `asyncHandler` pattern.

#### [MODIFY] [user.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/user.controller.ts)
- 3 methods → `asyncHandler` pattern.

#### [MODIFY] [setting.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/setting.controller.ts)
- 2 methods → `asyncHandler` pattern.

#### [MODIFY] [upload.controller.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/controllers/upload.controller.ts)
- 1 method → `asyncHandler` pattern.

---

### Step 1.13 — Implement Caching in ContentService

#### [MODIFY] [content.service.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/services/content.service.ts)
- `getPosts`: Cache-first lookup with key `posts:list:{queryHash}:{userId|anon}`. Returns `{ data, source: 'CACHE'|'DB' }`.
- `getPostBySlug`: Cache-first lookup with key `posts:slug:{slug}`. Returns `{ data, source }`.
- `createPost`, `updatePost`, `deletePost`: Invalidate cache via `CacheService.delByPattern('posts:*')` after mutation.
- Replace `console.error` with `logger`.

---

### Step 1.14 — Update `server.ts` to Use Winston

#### [MODIFY] [server.ts](file:///Users/tuanstrange/Documents/Fullstack%20Engineer/Purwadhika%20Bootcamp/Bootcamp%20Exercise/Module%205%20-%20Advanced%20Software%20Development%20/05%20Performance%20and%20Reliability/blog-app-1.4/server/src/server.ts)
- Replace all `console.log` / `console.error` calls with `logger.info` / `logger.error`.
- Add Redis graceful disconnect in the shutdown handler.

---

## Files Summary

| Action | File | Description |
|--------|------|-------------|
| NEW | `server/src/config/logger.ts` | Winston logger singleton |
| NEW | `server/src/config/redis.ts` | ioredis client singleton |
| NEW | `server/src/services/cache.service.ts` | Redis cache abstraction |
| NEW | `server/src/utils/asyncHandler.ts` | Async error wrapper |
| NEW | `server/src/middleware/requestId.middleware.ts` | Request ID generator |
| NEW | `server/src/middleware/performance.middleware.ts` | Response time logger |
| MODIFY | `server/.env` + `.env.example` | Add Redis env vars |
| MODIFY | `server/src/config/env.ts` | Validate new env vars |
| MODIFY | `server/src/utils/errors.ts` | Enhanced error classes |
| MODIFY | `server/src/middleware/error.middleware.ts` | Centralized error handler |
| MODIFY | `server/src/types/express.d.ts` | Add `req.id` type |
| MODIFY | `server/src/app.ts` | Wire up new middlewares |
| MODIFY | `server/src/server.ts` | Use Winston, Redis shutdown |
| MODIFY | `server/src/services/content.service.ts` | Add caching layer |
| MODIFY | All 7 controllers | Use `asyncHandler` |
| MODIFY | `docker-compose.yml` | Add Redis service |

---

## Verification Plan

### Automated Tests
```bash
# 1. Build to catch TypeScript errors
cd server && npm run build

# 2. Start Docker services (Postgres + Redis)
docker compose up -d postgres redis

# 3. Run the dev server
npm run dev -w server
```

### Manual Verification
1. **Cache hit/miss**: Call `GET /api/posts` twice — first response should log `[DB]`, second `[CACHE]`.
2. **Cache invalidation**: Create/update/delete a post, then `GET /api/posts` — should log `[DB]` (cache was cleared).
3. **Request ID**: Check response headers for `X-Request-Id` UUID.
4. **Performance log**: Check console/logs for `[Performance] GET /api/posts - Xms (CACHE)`.
5. **Error format**: Trigger a validation error and verify the new JSON shape `{ success: false, error: { code, message, details } }`.
6. **Log files**: Check that `logs/error.log` and `logs/combined.log` are created.
