# 🤖 Agent Context — Backend

> Context for the AI agent working on the Express.js backend.

## Quick Reference

| Item | Value |
|------|-------|
| Framework | Express.js 4 + TypeScript |
| Database | PostgreSQL (raw SQL via `pg`) |
| Auth | JWT + bcryptjs |
| Port | 4000 (dev) |
| Typecheck | `npx tsc --noEmit` |
| Dev server | `npm run dev` (tsx watch) |

## Request Lifecycle

```
HTTP Request
  → server.ts middleware chain (cors → json → morgan)
  → Router match (routes/*.routes.ts)
  → [authenticate middleware] → set req.userId
  → [validateBody middleware] → check required fields
  → Handler (in routes/*.routes.ts) → extract req data, call service
  → Service → raw SQL via pool.query()
  → Handler → format response
  → res.json()

If error at any point:
  → next(error) → errorHandler middleware → JSON error response
```

## Directory Reference: `routes/`

```
routes/auth.routes.ts      ← [Auth] Route + Handlers (Register, Login, Logout)
routes/todo.routes.ts      ← [Todo] Route + Handlers (CRUD, search, filter, reorder, public shared view)
routes/share.routes.ts     ← [Share] Route + Handlers (Create link, Redirect 302)
routes/analytics.routes.ts ← [Analytics] Route + Handlers (Summary)
```

## File Dependency Graph

```
config/env.ts ──→ config/db.ts ──→ services/*.ts ──→ routes/*.ts ──→ server.ts
                                         ↑                   ↑
                                  middleware/errorHandler.ts (AppError)
                                         ↑
                                   types/index.ts (Interfaces)
```

## Conventions

- **Types**: Always use explicit interfaces from `types/index.ts` for database models and service responses.
- **Services**: Raw SQL only, no ORM. Use `$1, $2` parameterized queries.
- **Routes/Handlers**: Logic for handling requests and responses is merged into route files to reduce boilerplate. Keep logic concise; move complex business logic to services.
- **Errors**: Always `throw new AppError(statusCode, code, message)`. The `AppError` class is defined in `middleware/errorHandler.ts`.
- **Auth**: `req.userId` available after `authenticate` middleware.
- **Order**: Specific routes BEFORE parametric (`:id`) routes.
- **Transactions**: Use `pool.connect()` → `BEGIN/COMMIT/ROLLBACK` → `client.release()`.

## How to Add a New Endpoint

1. Define new interfaces in `types/index.ts` if needed.
2. Add SQL query in `services/[domain].service.ts`.
3. Add route and handler logic in `routes/[domain].routes.ts`.
4. Register in `server.ts` if it's a new route group.
5. Verify: `npx tsc --noEmit`.

## Database Tables

```
users (id, name, email, password_hash, created_at)
  └── todos (id, user_id FK, text, completed, created_at, manual_index)
        └── share_links (id, todo_id FK, short_code, created_at)
```

Run SQL files in order: `sql/001_*.sql` → `002_*.sql` → `003_*.sql` → `004_*.sql` (optional).
