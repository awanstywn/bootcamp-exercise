# 🤖 Agent Context — Todo App v2.0

> This document provides context for the AI coding agent to continue or modify the project.
> Read this document **BEFORE** making any changes to the codebase.

---

## 📋 Project Status

| Item | Status |
|------|--------|
| Backend (Express + TypeScript) | ✅ Done, compiles clean |
| Frontend (React + TypeScript) | ✅ Done, compiles clean |
| Database Schema (SQL) | ✅ Files available in `backend/sql/` |
| Documentation (README, comments) | ✅ Done |

---

## 📁 Project Structure

```
todo-app-with-db/                       ← ROOT (monorepo)
├── package.json                        ← ⭐ Entry point: `npm run dev` → concurrently
├── frontend/                  ← Frontend React app
│   ├── src/
│   ├── README.md + agent.md
│   └── package.json
└── backend/                   ← Backend Express.js app
    ├── src/
    ├── README.md + agent.md
    └── package.json
```

**IMPORTANT:**
- Root `package.json` uses `concurrently` to run both projects with a single command.
- Frontend and backend have their own `package.json` and `node_modules`.
- Each layer has specific `README.md` and `agent.md` files.

### Backend: `backend/src/`

```
config/env.ts              ← Load + validate env vars
config/db.ts               ← pg.Pool connection (auto SSL)
types/index.ts             ← Centralized interfaces (User, Todo, etc.)
middleware/authenticate.ts ← JWT verify → req.userId
middleware/validateBody.ts ← Factory: check required fields
middleware/errorHandler.ts ← Global error catch (4-param) + AppError class
services/auth.service.ts   ← bcrypt, JWT, user queries
services/todo.service.ts   ← CRUD + search + transaction reorder
services/share.service.ts  ← Generate/resolve short code
services/analytics.service.ts ← 3 SQL queries (Aggregation)
routes/auth.routes.ts      ← [Auth] Route + Handlers (Register, Login, Logout)
routes/todo.routes.ts      ← [Todo] Route + Handlers (CRUD, search, filter, reorder)
routes/share.routes.ts     ← [Share] Route + Handlers (Create link, Redirect 302)
routes/analytics.routes.ts ← [Analytics] Route + Handlers (Summary)
server.ts                  ← Entry point: Express setup + Listen on PORT
```

### Frontend: `frontend/src/`

```
config/api.ts              ← VITE_API_BASE_URL
lib/axios.ts               ← Axios instance + JWT interceptor
types/types.ts             ← Todo, AppUser, AuthStore, TodoStore types
services/authService.ts    ← register/login/logout
services/todoService.ts    ← CRUD + clearCompleted + reorder
services/shareService.ts   ← createShareLink(todo_id)
services/analyticsService.ts ← fetchAnalytics()
store/useAuthStore.ts      ← Zustand: user, token, auth actions
store/useTodoStore.ts      ← Zustand: todos, optimistic UI
components/analytics/AnalyticsWidget.tsx ← Stats + chart (rendered in Header)
components/todo/TodoItem.tsx  ← Edit, toggle, share, DnD
components/todo/TodoList.tsx  ← DnD context
components/layout/Header.tsx  ← App title, theme toggle, burger menu + Profile Sidebar (Analytics)
pages/TodoPage.tsx         ← Main dashboard
pages/SharedTodoPage.tsx   ← Read-only shared todo
App.tsx                    ← Route config
main.tsx                   ← React root mount
```

---

## 🔑 Key Patterns

1. **Raw SQL** — `$1, $2` parameterized queries, no ORM.
2. **Stateless JWT** — Token in Zustand (persist localStorage), Axios interceptor.
3. **Type Safety** — Explicit interfaces in `backend/src/types/index.ts` for all database interactions.
4. **Merged Handlers** — Route definitions and request logic are combined in `routes/*.routes.ts` to minimize boilerplate.
5. **Flat Structure** — No more `controllers` or `utils` folders; logic is kept close to where it's used.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```
PORT=4000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=<random-64-chars>
BCRYPT_ROUNDS=12
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173
```

---

*Last updated: 2026-04-25*
