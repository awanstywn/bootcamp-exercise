# 📝 Todo List App v2.0

> Full-stack task management application with authentication, drag-and-drop, share links, and analytics dashboard.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **State Management** | Zustand 5 (persist middleware) |
| **Styling** | Tailwind CSS v4 |
| **Drag & Drop** | @dnd-kit/core + sortable |
| **Form** | Formik + Yup |
| **HTTP Client** | Axios (interceptors) |
| **Backend** | Express.js 4 + TypeScript |
| **Database** | PostgreSQL 16 (raw SQL via `pg` driver) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |

## 📁 Project Structure

```
todo-app-with-db/                       ← Root project (monorepo)
│
├── frontend/                  ← Frontend React app
│   ├── src/
│   │   ├── components/                 ← UI components
│   │   │   ├── analytics/              ← AnalyticsWidget
│   │   │   ├── controls/               ← Search, Sort, Filter
│   │   │   ├── layout/                 ← AppShell, Header
│   │   │   ├── shared/                 ← EmptyState
│   │   │   └── todo/                   ← TodoList, TodoItem, TodoInput, TodoFooter
│   │   ├── config/api.ts               ← Base URL to backend
│   │   ├── hooks/                      ← useFilteredTodos, useIdleTimer
│   │   ├── lib/axios.ts                ← Axios instance + interceptors
│   │   ├── pages/                      ← SignIn, SignUp, TodoPage, SharedTodoPage
│   │   ├── services/                   ← authService, todoService, shareService, analyticsService
│   │   ├── store/                      ← useAuthStore, useTodoStore (Zustand)
│   │   ├── types/types.ts              ← TypeScript interfaces
│   │   ├── utils/sortTodos.ts          ← Sort utility
│   │   └── validations/                ← Yup schemas
│   ├── .env, index.html, vite.config.ts, tsconfig.json, package.json
│   └── README.md + agent.md            ← Frontend specific docs
│
├── backend/                   ← Backend Express.js app
│   ├── src/
│   │   ├── config/                     ← env.ts, db.ts
│   │   ├── controllers/               ← auth, todo, share, analytics
│   │   ├── middleware/                 ← authenticate, validateBody, errorHandler
│   │   ├── routes/                     ← auth, todo, share, analytics
│   │   ├── services/                   ← Business logic + raw SQL
│   │   ├── utils/                      ← AppError, generateCode
│   │   ├── app.ts                      ← Express setup
│   │   └── server.ts                   ← HTTP server entry
│   ├── sql/                            ← Database schema (001-004)
│   ├── .env, package.json
│   └── README.md + agent.md            ← Backend specific docs
│
├── package.json                        ← ⭐ ROOT ENTRY POINT (concurrently)
├── README.md                           ← This documentation
├── agent.md                            ← Context for AI agent
├── impl_plan.md                        ← Complete implementation plan
└── .gitignore
```

## 🚀 Quick Start

### 1. Database Setup

```bash
psql -U postgres
CREATE DATABASE todoapp;
\q
```

### 2. Environment Configuration

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env → fill in DATABASE_URL, JWT_SECRET, etc.
```

```bash
# Frontend
cd frontend
# Edit .env → ensure VITE_API_BASE_URL=http://localhost:4000
```

### 3. Run SQL Schema

Execute SQL files in `backend/sql/` **in order**:
```bash
psql -U postgres -d todoapp -f backend/sql/001_create_users.sql
psql -U postgres -d todoapp -f backend/sql/002_create_todos.sql
psql -U postgres -d todoapp -f backend/sql/003_create_share_links.sql
psql -U postgres -d todoapp -f backend/sql/004_seed_example.sql  # optional
```

### 4. Install Dependencies

```bash
# From root — install all at once
npm run install:all

# Or manually per project:
cd backend && npm install
cd ../frontend && npm install
cd .. && npm install           # install concurrently at root
```

### 5. Run Application

```bash
# ⭐ ONE COMMAND — run frontend + backend concurrently
npm run dev

# Or run separately:
npm run dev:backend    # Backend only (port 4000)
npm run dev:frontend   # Frontend only (port 5173)
```

Open [http://localhost:5173](http://localhost:5173) in browser.

## 🔑 Key Features

### Authentication
- ✅ Register + Login with JWT token
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Auto-logout when session expires (7 days)
- ✅ Idle timer (5 minutes inactive → logout)

### Todo CRUD
- ✅ Add, edit (inline), delete, toggle complete
- ✅ Drag-and-drop reorder (@dnd-kit)
- ✅ Search (ILIKE) + filter (all/active/completed) + sort
- ✅ Clear completed (bulk delete)
- ✅ Optimistic UI (instant feedback, rollback on error)

### v2.0 Features
- ✅ Share Link — Short URL generation with 302 redirect and dedicated public frontend interface.
- ✅ Analytics Widget — Real-time task statistics (total, completion rate, fixed 7-day trend with interactive tooltips) integrated into the Profile Sidebar.
- ✅ Shared Todo Page — Public, read-only view for shared todos (API and Frontend UI).
- ✅ PostgreSQL regex search — Advanced text matching on the backend.

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Register new account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/todos` | ✅ | All user todos |
| POST | `/api/todos` | ✅ | Create new todo |
| PUT | `/api/todos/:id` | ✅ | Update todo |
| DELETE | `/api/todos/:id` | ✅ | Delete todo |
| GET | `/api/todos/search?q=` | ✅ | Search by keyword |
| GET | `/api/todos/filter?status=` | ✅ | Filter by status |
| GET | `/api/todos/regex?pattern=` | ✅ | Search by regex |
| DELETE | `/api/todos/completed` | ✅ | Delete all completed |
| PUT | `/api/todos/reorder` | ✅ | Bulk reorder |
| GET | `/api/todos/shared/:id` | ❌ | View shared todo |
| POST | `/api/share` | ✅ | Create share link |
| GET | `/s/:code` | ❌ | 302 Redirect |
| GET | `/api/analytics` | ✅ | Analytics statistics |

## 🗄️ Database Schema

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    users     │      │    todos     │      │ share_links  │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ id (UUID PK) │─────▸│ user_id (FK) │      │ id (UUID PK) │
│ name         │      │ id (UUID PK) │◄─────│ todo_id (FK) │
│ email (UQ)   │      │ text         │      │ short_code   │
│ password_hash│      │ completed    │      │ created_at   │
│ created_at   │      │ created_at   │      └──────────────┘
└──────────────┘      │ manual_index │
                      └──────────────┘
```

## 🔒 Security

- **JWT** — Token-based authentication (7 days expiry)
- **bcryptjs** — One-way password hashing
- **Parameterized queries** — `$1, $2` prevents SQL injection
- **Ownership check** — Every todo query includes `user_id`
- **CORS** — Only permitted frontend URLs
- **Generic error messages** — Prevents user enumeration

## 📚 SQL Concepts

| Concept | Location | Explanation |
|--------|--------|------------|
| `INNER JOIN` | share.service.ts | Join share_links + todos |
| `GROUP BY` | analytics.service.ts | Group todos per day |
| `HAVING` | analytics.service.ts | Filter days with ≥ 3 todos |
| `COUNT(*) FILTER` | analytics.service.ts | Count subset of total |
| `COALESCE` | todo.service.ts | Default value if NULL |
| `TRANSACTION` | todo.service.ts | BEGIN/COMMIT/ROLLBACK |
| `CASCADE DELETE` | SQL schema | Delete parent → delete children |
| `ILIKE` | todo.service.ts | Case-insensitive LIKE |
| `~` (regex) | todo.service.ts | PostgreSQL regex operator |
| `NULLIF` | analytics.service.ts | Prevent division by zero |

## 🛠️ Scripts

### Root (entry point — run from `todo-app-with-db/`)
```bash
npm run dev            # ⭐ Run FE + BE concurrently
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend only
npm run install:all    # Install deps in both projects
npm run typecheck      # Check TypeScript in both projects
npm run build          # Build frontend production bundle
```

### Backend (`backend/`)
```bash
npm run dev        # Start dev server (nodemon + ts-node)
npm run build      # Compile TypeScript
npm start          # Run production build
npm run typecheck  # Check TypeScript without compile
```

### Frontend (`frontend/`)
```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Build production bundle
npm run preview    # Preview production build
```

## 📄 License

This project was created as part of the Purwadhika Bootcamp Module 3 Exercise.
