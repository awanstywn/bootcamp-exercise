# 📘 Todo List App v2.0 — Implementation Plan

> **Document Version:** 1.0  
> **Created:** 2026-04-25  
> **Target Stack:** React + TypeScript + Vite + Zustand + Express.js + PostgreSQL (pg driver)  

---

## LIST OF CONTENTS

1. [App Overview](#1-app-overview)
2. [Plot Analogy in Simple Language](#2-plot-analogy-in-simple-language)
3. [Step-by-Step Request Flowchart](#3-step-by-step-request-flowchart)
4. [Complete File Structure](#4-complete-file-structure)
5. [Full Feature List](#5-full-feature-list)
6. [Complete Route Table](#6-complete-route-table)
7. [Middleware List](#7-middleware-list)
8. [Database Design](#8-database-design)
9. [Security Plan & Validation](#9-security-plan--validation)
10. [User Flow & Features](#10-user-flow--features)
11. [Backend Implementation Details](#11-backend-implementation-details)
12. [Frontend Implementation Details](#12-frontend-implementation-details)
13. [Database Setup Guide — PostgreSQL Locale](#13-database-setup-guide--postgresql-locale)
15. [Step-by-Step Implementation Guide](#15-step-by-step-implementation-guide)
17. [What to Build After MVP](#17-what-to-build-after-mvp)

---

## 1. Application Overview

### Description


### Complete Tech Stack

| Layer | Teknologi | Versi | Catatan |
|-------|-----------|-------|---------|
| Language | TypeScript | ^5.x | Frontend + Backend |
| Bundler | Vite | ^6.x | Frontend dev server |
| UI Framework | React | ^18.x | Component-based UI |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| State Management | Zustand | ^5.x | Global state |
| Routing (FE) | React Router DOM | ^6.x | Client-side routing |
| Drag & Drop | @dnd-kit | ^6.x | Accessible DnD |
| HTTP Client | Axios | ^1.x | Interceptors for auth |
| Form Management | Formik | ^2.x | Form state |
| Schema Validation | Yup | ^1.x | Form validation |
| Backend Framework | Express.js | ^4.x | REST API server |
| Backend Language | TypeScript | ^5.x | ts-node for dev |
| Database Driver | pg (node-postgres) | ^8.x | Raw SQL, tanpa ORM |
| Password Hashing | bcryptjs | ^2.x | Hash password in backend |
| Auth Token | jsonwebtoken (JWT) | ^9.x | Menggantikan Backendless user-token |
| Database (Lokal) | PostgreSQL | ^16.x | Installed lokal |
| Environment | dotenv | ^16.x | Manage env vars |
| CORS | cors | ^2.x | Express middleware |
| Process Manager | nodemon | ^3.x | Auto-restart dev server |

### Key Architectural Decisions

| Decision | Choice | Reason |
|-----------|---------|--------|
| ORM vs Raw SQL | Raw SQL with `pg` driver | According to task constraints; forces a deeper understanding of SQL; not over-engineering |
| Auth Token | JWT (not Backendless user-token) | Self-hosted; does not depend on third party services; industry standards |
| Password Storage | bcryptjs | Industry standard for password hashing; never save plain text |
| Redirect Feature | Express route `res.redirect(302)` + short code in DB | The simplest and native Express way to implement redirect |
| Analytics | Server-side SQL aggregation, data sent to frontend | More efficient than compute on the frontend; harness the power of SQL |

---

## 2. Plot Analogy in Simple Language

### Imagine This Application Like A Restaurant

Every time you use the Todo App, there is a service cycle that occurs — just like in a restaurant:

```
KAMU (User)
  = Guests arriving at the restaurant
  
BROWSER / REACT APP (Frontend)
  = The table where you sit + The menu book you hold

AXIOS (HTTP Client)
  = The waiter who takes your order and delivers it to the kitchen

EXPRESS.JS ROUTES (Backend Entry Point)
  = The restaurant entrance that directs guests to the right table

MIDDLEWARE (Auth, Validation, Logging)
  = The receptionist who checks your reservation before you sit,
    and the cashier who ensures valid payment before entering

CONTROLLER
  = Kitchen supervisor who receives orders and delegates to the chef

SERVICE
  = Head chef who knows how to make every dish (business logic)

POOL/DATABASE (pg Pool → PostgreSQL)
  = Food ingredient warehouse + refrigerator (where data is stored permanently)

JWT TOKEN
  = Restaurant member card. You show it at the beginning, the waiter doesn't need
    to ask for your identity again every time you order

OPTIMISTIC UI
  = When you order, the waiter immediately says "Okay, ready!" and enters it
    into the bill. If the kitchen runs out of ingredients, the waiter returns
    and removes it from the bill (rollback).

SHORT URL / SHARE LINK
  = Short table number. You can give the table number "T42" to your friend
    instead of the full restaurant address, and the receptionist will direct
    your friend to the correct table (redirect 302).

ANALYTICS WIDGET
  = Restaurant manager's daily report: how many orders are completed today,
    how many are pending, which categories are ordered the most.
```

### Technical Mapping → Analogy

| Technical Components | Analogy |
|----------------|---------|
| React Components | Table + visual display of menu |
| Zustand Store | The servant's notebook in his hand (temporary state) |
| Axios Request | The waiter walks into the kitchen with the order |
| Express Routers | Directional board in the kitchen ("Drink orders to bar, food to chef") |
| `authenticate` middleware | Receptionist checks member card (JWT) |
| `validateBody` middleware | Cashier checks the order is not empty / not strange |
| Controllers | Supervisor who receives orders and delegates |
| Service functions | The chef who executes the recipe |
| `pg.Pool.query()` | The chef enters the warehouse and takes/stores the ingredients |
| PostgreSQL | Permanent warehouse |
| JWT | Member card |
| 302 Redirects | The receptionist who said "Your table is over there" |

---

## 3. Flowchart Request Step by Step

### Flow 1: User Login (Sign In)

```
USER types email + password → click "Sign In"
│
├─ [FRONTEND] Formik local validation (Yup: email format, password min 8 chars)
│   ├─ FAILED → show error in form (do not send request)
│   └─ SUCCESS → continue below
│
├─ [FRONTEND] useAuthStore.signIn(email, password) called
│   └─ set({ isLoading: true })
│
├─ [AXIOS] POST http:// localhost:4000/api/auth/login
│   Headers: { Content-Type: application/json }
│   Body: { email, password }
│
├─ [EXPRESS] Request enters server.ts
│   └─ cors() middleware → check allowed origin ✓
│   └─ express.json() → parse body ✓
│   └─ morgan logger → log request to console
│
├─ [ROUTER] routes/auth.routes.ts
│   └─ POST /api/auth/login → AuthController.login
│
├─ [MIDDLEWARE] validateBody(['email','password'])
│   ├─ FAILED → return 400 { error: "VALIDATION_ERROR", message: "..." }
│   └─ SUCCESS → next()
│
├─ [CONTROLLER] AuthController.login(req, res)
│   └─ extract { email, password } from req.body
│   └─ call authService.login(email, password)
│
├─ [SERVICE] authService.login(email, password)
│   ├─ Query: SELECT id, name, email, password_hash FROM users WHERE email = $1
│   ├─ User not found → throw Error("INVALID_CREDENTIALS")
│   ├─ bcrypt.compare(password, password_hash)
│   │   ├─ DOES NOT MATCH → throw Error("INVALID_CREDENTIALS")
│   │   └─ MATCHES → continue
│   └─ jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
│   └─ return { user: { id, name, email }, token }
│
├─ [CONTROLLER] → return 200 { user, token }
│
├─ [AXIOS] Response received
│
└─ [FRONTEND] useAuthStore
    └─ set({ user, userToken: token, isLoggedIn: true, isLoading: false })
    └─ useEffect detects isLoggedIn = true → navigate("/")
    └─ TodoPage mount → fetchTodos(user.id) called
```

---

### Flow 2: Adding Todo (Add Task)

```
USER types new task → presses Enter
│
├─ [FRONTEND] TodoInput.tsx → store.addTodo() called
│
├─ [ZUSTAND] useTodoStore.addTodo()
│   ├─ OPTIMISTIC: create temporary todo with tempId
│   ├─ set({ todos: [...todos, tempTodo] })  ← INSTANT UI update
│   └─ set({ isSyncing: true })
│
├─ [AXIOS] POST http:// localhost:4000/api/todos
│   Headers: { Authorization: "Bearer <jwt_toton>" }
│   Body: { text, completed: false, manual_index }
│
├─ [EXPRESS MIDDLEWARE CHAIN]
│   └─ authenticate → verify JWT → set req.userId
│   └─ validateBody(['text']) → check text exists and not empty
│
├─ [CONTROLLER] TodoController.create(req, res)
│   └─ { text } = req.body
│   └─ userId = req.userId (from middleware)
│   └─ call todoService.create(userId, text)
│
├─ [SERVICE] todoService.create(userId, text)
│   ├─ Calculate manual_index:
│   │   SELECT COALESCE(MAX(manual_index), -1) + 1 FROM todos WHERE user_id = $1
│   ├─ INSERT INTO todos (user_id, text, completed, created_at, manual_index)
│   │   VALUES ($1, $2, false, NOW(), $3) RETURNING *
│   └─ return newTodo
│
├─ [CONTROLLER] → return 201 { todo: newTodo }
│
├─ [AXIOS] Response received
│
└─ [ZUSTAND] 
    ├─ SUCCESS: replace tempTodo with real todo (use id from server)
    │   set({ todos: todosWithRealId, isSyncing: false })
    └─ FAILED: revert (delete tempTodo)
        set({ todos: snapshot, isSyncing: false, error: "Failed to save" })
```

---

### Flow 3: Share Link Todo (Short URL → Redirect 302)

```
USER click icon "Share" on todo item
│
├─ [FRONTEND] TodoItem.tsx → handleShare(todo.id) called
│
├─ [AXIOS] POST http:// localhost:4000/api/share
│   Headers: { Authorization: "Bearer <jwt_toton>" }
│   Body: { todo_id: todo.id }
│
├─ [CONTROLLER] ShareController.create(req, res)
│   └─ call shareService.createShortCode(todo_id, userId)
│
├─ [SERVICE] shareService.createShortCode(todo_id, userId)
│   ├─ Check if todo belongs to userId (authorization check)
│   ├─ Check if short_code already exists for this todo:
│   │   SELECT short_code FROM share_links WHERE todo_id = $1
│   │   ├─ Already exists → return kode the old one (no duplicates)
│   │   └─ Does not exist yet → generate 8 char unique alphanumeric code
│   ├─ INSERT INTO share_links (todo_id, short_code, created_at)
│   │   VALUES ($1, $2, NOW()) RETURNING *
│   └─ return { shortUrl: BASE_URL + "/s/" + short_code }
│
├─ [FRONTEND] copy shortUrl to clipboard → show toast "Link copied!"
│
└─ ── WHEN OTHERS/YOURSELF OPEN THE LINK ──
    │
    └─ Browser opens: http:// localhost:4000/s/ABC12345
    │
    ├─ [EXPRESS ROUTER] GET /s/:code → ShareController.redirect
    │
    ├─ [SERVICE] shareService.resolveCode("ABC12345")
    │   ├─ SELECT todo_id FROM share_links WHERE short_code = $1
    │   ├─ Not found → return null
    │   └─ Found → return todo_id
    │
    ├─ [CONTROLLER]
    │   ├─ Not found → res.redirect(302, BASE_URL + "/not-found")
    │   └─ Found → res.redirect(302, FRONTEND_URL + "/shared/" + todo_id)
    │
    └─ Browser redirect → page /shared/[todo_id] in frontend
        └─ Frontend fetch todo details and show (read-only view)
```

---

### Flow 4: Analytics Widget Loaded

```
TodoPage mount → useEffect → fetchAnalytics(userId) called
│
├─ [AXIOS] GET http:// localhost:4000/api/analytics
│   Headers: { Authorization: "Bearer <jwt_toton>" }
│
├─ [CONTROLLER] AnalyticsController.getSummary(req, res)
│   └─ call analyticsService.getSummary(req.userId)
│
├─ [SERVICE] analyticsService.getSummary(userId)
│   ├─ Query 1 (Summary):
│   │   SELECT
│   │     COUNT(*) AS total,
│   │     COUNT(*) FILTER (WHERE completed = true) AS completed_count,
│   │     COUNT(*) FILTER (WHERE completed = false) AS active_count
│   │   FROM todos WHERE user_id = $1
│   │
│   ├─ Query 2 (Daily trend, last 7 days — GROUP BY):
│   │   SELECT
│   │     DATE(created_at) AS day,
│   │     COUNT(*) AS created,
│   │     COUNT(*) FILTER (WHERE completed = true) AS completed
│   │   FROM todos
│   │   WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
│   │   GROUP BY DATE(created_at)
│   │   ORDER BY day ASC
│   │
│   ├─ Query 3 (Busiest days — HAVING):
│   │   SELECT DATE(created_at) AS day, COUNT(*) AS total
│   │   FROM todos WHERE user_id = $1
│   │   GROUP BY DATE(created_at)
│   │   HAVING COUNT(*) >= 3
│   │   ORDER BY total DESC LIMIT 5
│   │
│   └─ return { summary, dailyTrend, busiestDays }
│
├─ [FRONTEND] AnalyticsWidget.tsx receives data
└─ Render: card ringkasan + mini bar chart (tren 7 hari)
```

---

## 4. Complete File Structure

### Frontend (no major changes, just updated a few files)

```
frontend/                     ← Frontend folder name
├── public/
│   └── favicon.ico                    ← Browser tab icon
│
├── src/
│   ├── components/
│   │   ├── controls/
│   │   │   ├── Search.tsx             ← Unchanged
│   │   │   ├── SortDropDown.tsx       ← Unchanged
│   │   │   └── FilterDropDown.tsx     ← Unchanged
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           ← Unchanged
│   │   │   └── Header.tsx             ← Unchanged
│   │   │
│   │   ├── shared/
│   │   │   └── EmptyState.tsx         ← Unchanged
│   │   │
│   │   ├── analytics/
│   │   │   └── AnalyticsWidget.tsx    ← [BARU] Todo statistics widget in TodoPage
│   │   │
│   │   └── todo/
│   │       ├── TodoList.tsx           ← Unchanged
│   │       ├── TodoItem.tsx           ← [UPDATE] Add share button + handler
│   │       ├── TodoInput.tsx          ← Unchanged
│   │       └── TodoFooter.tsx         ← Unchanged
│   │
│   ├── config/
│   │   └── api.ts                     ← [REPLACE] Replace backendless.ts → configure own backend BASE_URL
│   │
│   ├── lib/
│   │   └── axios.ts                   ← [UPDATE] Replace header 'user-token' → 'Authorization: Bearer <token>'
│   │
│   ├── services/
│   │   ├── authService.ts             ← [REWRITE] Call Express endpoint /api/auth/* not Backendless
│   │   ├── todoService.ts             ← [REWRITE] Call Express endpoint /api/todos/* not Backendless
│   │   ├── shareService.ts            ← [BARU] Function createShareLink(todoId)
│   │   └── analyticsService.ts        ← [BARU] Function fetchAnalytics()
│   │
│   ├── pages/
│   │   ├── SignIn.tsx                 ← Unchanged (UI remains the same)
│   │   ├── SignUp.tsx                 ← Unchanged (UI remains the same)
│   │   ├── TodoPage.tsx               ← [UPDATE] Add AnalyticsWidget + fetchAnalytics in useEffect
│   │   └── SharedTodoPage.tsx         ← [BARU] Read-only page for shared todo via link
│   │
│   ├── store/
│   │   ├── useTodoStore.ts            ← [UPDATE] Small: objectId → id (field name adjusted to new backend)
│   │   └── useAuthStore.ts            ← [UPDATE] userToken JWT format; remove Backendless-specific fields
│   │
│   ├── hooks/
│   │   ├── useFilteredTodos.ts        ← Unchanged
│   │   └── useIdleTimer.ts            ← Unchanged
│   │
│   ├── types/
│   │   └── types.ts                   ← [UPDATE] Rename objectId → id; add Analytics, ShareLink types
│   │
│   │   └── sortTodos.ts               ← Unchanged
│   │
│   ├── validations/
│   │   └── authSchema.ts              ← Unchanged
│   │
│   ├── assets/
│   │   ├── dark-bg.png                ← Unchanged
│   │   └── light-bg.png               ← Unchanged
│   │
│   ├── App.tsx                        ← [UPDATE] Add route /shared/:id
│   ├── App.css                        ← Unchanged
│   ├── main.tsx                       ← Unchanged
│   └── index.css                      ← Unchanged
│
├── .env                               ← [UPDATE] Replace VITE_BACKENDLESS_* → VITE_API_BASE_URL
├── index.html
├── tsconfig.json
├── vite.config.ts
└── package.json                       ← [UPDATE] Remove Backendless dependency if any
```

### Backend (Express.js + TypeScript — project baru)

```
backend/                      ← Separate folder from frontend
├── src/
│   ├── server.ts                         ← Express entry point: setup global middleware, register all routes
│   │
│   ├── routes/
│   │   ├── auth.routes.ts             ← Register route: POST /register, POST /login, POST /logout
│   │   ├── todo.routes.ts             ← Register route: GET, POST, PUT, DELETE for /todos
│   │   ├── share.routes.ts            ← Register route: POST /share, GET /s/:code (redirect)
│   │   └── analytics.routes.ts        ← Register route: GET /analytics
│   │
│   ├── 
│   │   ├── auth.routes.ts         ← Receive auth request, validate input, call authService, send response
│   │   ├── todo.routes.ts         ← Receive CRUD todo request, call todoService, send response
│   │   ├── share.routes.ts        ← Create short link, handle redirect 302
│   │   └── analytics.routes.ts    ← Fetch analytics data from service, send to frontend
│   │
│   ├── services/
│   │   ├── auth.service.ts            ← Logic: hash password, verify, generate JWT
│   │   ├── todo.service.ts            ← Logic: all CRUD todo operations with raw SQL
│   │   ├── share.service.ts           ← Logic: generate short code, resolve code → todo_id
│   │   └── analytics.service.ts       ← Logic: all analytics SQL queries (GROUP BY, HAVING, JOIN, etc.)
│   │
│   ├── middleware/
│   │   ├── authenticate.ts            ← Verify JWT in Authorization header; set req.userId
│   │   ├── validateBody.ts            ← Factory: check required fields exist in req.body
│   │   └── errorHandler.ts            ← Global error handler: catch all errors, format JSON response
│   │
│   ├── config/
│   │   ├── db.ts                      ← Create pg.Pool with DATABASE_URL from env; export pool
│   │   └── env.ts                     ← Load and validate all env variables; export as object
│   │
│       ├── generateCode.ts            ← Function generate random alphanumeric string (for short URL)
│       └── AppError.ts                ← Custom Error class with statusCode + errorCode
│
├── sql/
│   ├── 001_create_users.sql           ← DDL: CREATE TABLE users
│   ├── 002_create_todos.sql           ← DDL: CREATE TABLE todos + index
│   ├── 003_create_share_links.sql     ← DDL: CREATE TABLE share_links + index
│   └── 004_seed_example.sql           ← Optional: sample data for testing
│
├── .env                               ← Environment variable (DO NOT commit to git)
├── .env.example                       ← Template env variable (safe to commit)
├── .gitignore
├── tsconfig.json
├── nodemon.json                       ← Nodemon configuration to watch TypeScript files
└── package.json
```

---

## 5. Complete Feature List

### Frontend Features

| ID | Page/Component | Features | Status |
|----|--------|-------|--------|
| FE-01 | SignIn.tsx | Email+password login form with Formik+Yup | MAINTAINED |
| FE-02 | SignUp.tsx | Registration form with NIST password validation | MAINTAINED |
| FE-03 | TodoPage.tsx | Main dashboard: Header + Input + Search + List + Footer | MAINTAINED |
| FE-04 | TodoPage.tsx | AnalyticsWidget: statistics card + 7 day trend | NEW |
| FE-05 | TodoItem.tsx | Share todo button → copy short link to clipboard | NEW |
| FE-06 | SharedTodoPage.tsx | Read-only page to view shared todos | NEW |
| FE-07 | App.tsx | Protected routing: redirect /signin if not logged in | MAINTAINED (update route) |
| FE-08 | Header.tsx | Burger menu overlay: user profile + sign out | MAINTAINED |
| FE-09 | TodoList.tsx | Drag-and-drop reorder (DnD Kit) | MAINTAINED |
| FE-10 | TodoItem.tsx | Inline edit, toggle, delete, checkbox | MAINTAINED |
| FE-11 | Search.tsx | Real-time search + sort dropdown + filter dropdown | MAINTAINED |
| FE-12 | TodoFooter.tsx | Active counter + clear completed + filter tab | MAINTAINED |
| FE-13 | useIdleTimer.ts | Auto-logout after 5 minutes of idle | MAINTAINED |
| FE-14 | axios.ts | Request interceptor: inject JWT token | UPDATE (header format changed) |

### Backend Features

| ID | Route Group | Feature | Description |
|----|-------------|-------|-----------|
| BE-01 | /api/auth | Register user | Hash password + simpan to DB |
| BE-02 | /api/auth | Login user | Verifikasi password + issue JWT |
| BE-03 | /api/auth | Logout | Invalidate session (client-side: hapus token) |
| BE-04 | /api/todos | Fetch todos | SELECT todos milik user; support query param filter |
| BE-05 | /api/todos | Create todo | INSERT + hitung manual_index otomatis |
| BE-06 | /api/todos | Update todo | UPDATE text / completed / manual_index |
| BE-07 | /api/todos | Delete todo | DELETE by id (ownership check) |
| BE-08 | /api/todos | Bulk delete | DELETE todos completed milik user |
| BE-09 | /api/todos | Reorder | UPDATE manual_index bulk via SQL transaction |
| BE-10 | /api/share | Create short link | Generate kode + simpan to share_links |
| BE-11 | /s/:code | Redirect 302 | Resolve code → redirect to frontend URL |
| BE-12 | /api/todos/search | Search by query | SELECT WHERE text ILIKE $1 (case-insensitive) |
| BE-13 | /api/todos/filter | Filter by status | SELECT WHERE completed = true/false |
| BE-14 | /api/todos/regex | Search by regex | SELECT WHERE text ~ $1 (PostgreSQL regex) |
| BE-15 | /api/analytics | Summary todo | COUNT, FILTER, agregasi statistik |
| BE-16 | /api/analytics | Tren harian | GROUP BY DATE(created_at) 7 hari terakhir |
| BE-17 | /api/analytics | Busiest days | GROUP BY + HAVING COUNT(*) >= threshold |
| BE-18 | Middleware | authenticate | Verify JWT in every protected route |
| BE-19 | Middleware | validateBody | Check required fields in request body |
| BE-20 | Middleware | errorHandler | Global error handling, consistent response format |

### Database Features

| ID | Table | Feature | SQL Type |
|----|-------|-------|----------|
| DB-01 | users | Store user accounts | Table + unique email constraint |
| DB-02 | todos | Store tasks per user | Table + foreign key to users |
| DB-03 | share_links | Store short code per todo | Table + unique short_code |
| DB-04 | todos | Ownership filter | WHERE user_id = $1 |
| DB-05 | todos | Manual ordering | ORDER BY manual_index ASC |
| DB-06 | todos | Date sorting | ORDER BY created_at DESC/ASC |
| DB-07 | todos | Text search | WHERE text ILIKE '%keyword%' |
| DB-08 | todos | Regex search | WHERE text ~ 'pattern' |
| DB-09 | todos | Status filter | WHERE completed = true/false |
| DB-10 | todos | Analytics aggregasi | COUNT(*), COUNT FILTER, GROUP BY |
| DB-11 | todos | Tren harian | GROUP BY DATE(created_at) |
| DB-12 | todos | Busiest days | GROUP BY + HAVING COUNT(*) >= 3 |
| DB-13 | todos + share_links | Join data | INNER JOIN to resolve share link |
| DB-14 | todos | Bulk reorder | UPDATE dalam SQL TRANSACTION |
| DB-15 | All tables | Performance index | Index on user_id, created_at, short_code |

---

## 6. Complete Route Table

| Method | Path | Auth | Middleware | Controller.Method | Description |
|--------|------|------|------------|-------------------|-----------|
| POST | /api/auth/register | ❌ | validateBody(['name','email','password']) | AuthController.register | Register new account; hash password; save user |
| POST | /api/auth/login | ❌ | validateBody(['email','password']) | AuthController.login | Login; verify password; return JWT token |
| POST | /api/auth/logout | ✅ | authenticate | AuthController.logout | Logout (client removes token; server logs event) |
| GET | /api/todos | ✅ | authenticate | TodoController.getAll | Fetch all user's todos; sort by manual_index |
| GET | /api/todos/search | ✅ | authenticate | TodoController.search | Search todo by text; query param: ?q=keyword |
| GET | /api/todos/filter | ✅ | authenticate | TodoController.filterByStatus | Filter by status; query param: ?status=active|completed |
| GET | /api/todos/regex | ✅ | authenticate | TodoController.searchRegex | Search by PostgreSQL regex; query param: ?pattern=^Buy |
| GET | /api/todos/:id | ✅ | authenticate | TodoController.getOne | Fetch one todo by ID (ownership check) |
| POST | /api/todos | ✅ | authenticate, validateBody(['text']) | TodoController.create | Create new todo; auto-assign manual_index |
| PUT | /api/todos/:id | ✅ | authenticate, validateBody([]) | TodoController.update | Update text / completed / manual_index |
| DELETE | /api/todos/:id | ✅ | authenticate | TodoController.remove | Delete one todo (ownership check) |
| DELETE | /api/todos/completed | ✅ | authenticate | TodoController.clearCompleted | Delete all completed user's todos |
| PUT | /api/todos/reorder | ✅ | authenticate, validateBody(['updates']) | TodoController.reorder | Bulk update manual_index dalam transaction |
| POST | /api/share | ✅ | authenticate, validateBody(['todo_id']) | ShareController.create | Create short link for todo |
| GET | /s/:code | ❌ | - | ShareController.redirect | Redirect 302 to frontend URL of shared todo |
| GET | /api/analytics | ✅ | authenticate | AnalyticsController.getSummary | Fetch summary + trend + busiest days |

---

## 7. Register Middleware

### 1. `authenticate.ts`

- **File name:** `src/middleware/authenticate.ts`
- **What does:** Read the `Authorization: Bearer <token>` header, extract the JWT token, verify using `JWT_SECRET`, and if valid save the `userId` to `req.userId` for the controller to use.
- **Position in chain:** Installed at route level for all protected endpoints (after global middleware, before controller).
- **On success:** Calls `next()` and `req.userId` is available.
- **If failed:**
  - Missing header → return `401 { error: "UNAUTHORIZED", message: "Token does not exist" }`
  - Token expired → return `401 { error: "TOKEN_EXPIRED", message: "Your session has expired" }`
  - Invalid token → return `401 { error: "INVALID_TOKEN", message: "Invalid token" }`
- **Used in routes:** All routes except POST /auth/register, POST /auth/login, GET /s/:code

---

### 2. `validateBody.ts`

- **File name:** `src/middleware/validateBody.ts`
- **What does:** Factory middleware — accepts an array of required field names. Checks each field: whether it is in `req.body` and not an empty string/whitespace.
- **Position in chain:** Installed after `authenticate` (if present), before controller.
- **On success:** Call `next()`.
- **If failed:** Field does not exist or is empty → return `400 { error: "VALIDATION_ERROR", message: "Field 'text' is required" }`
- **Used in routes:** POST /auth/register, POST /auth/login, POST /todos, PUT /todos/reorder, POST /share

---

### 3. `errorHandler.ts`

- **File name:** `src/middleware/errorHandler.ts`
- **What does:** Global error handler Express (4 parameters: err, req, res, next). Captures all errors thrown from the controller or service. Distinguish between `AppError` (known business errors) and unexpected errors.
- **Position in chain:** Installed LAST in `server.ts`, after all routes.
- **If AppError:** Return status code of error + `{ error: error.code, message: error.message }`
- **If other error:** Return `500 { error: "INTERNAL_ERROR", message: "A server error occurred" }` (details not exposed to client)
- **Used on:** All routes (global)

---

## 8. Database Design

### Table `users`

| Field Name | Data Type | Constraints | Description |
|------------|-----------|------------|-----------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user ID |
| name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email to login |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt result of password |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the account was created |

**Primary Key:** `id`
**Additional index:** `CREATE UNIQUE INDEX idx_users_email ON users(email)` — speeds up login queries (WHERE email = $1).
**One line example:**```
id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
name: "Awan Pratama"
email: "awan@example.com"
password_hash: "$2b$10$abcdefghijklmnopqrstuvuv..."
created_at: "2026-01-15 09:30:00+07"
```

---

### Table `all`

| Nama Field | Data Type | Constraint | Description |
|------------|-----------|------------|-----------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik todo |
| user_id | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | Todo owner |
| text | TEXT | NOT NULL | Task text |
| completed | BOOLEAN | NOT NULL, DEFAULT false | Completed status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Time todo was created |
| manual_index | INTEGER | NOT NULL, DEFAULT 0 | Drag-and-drop order |

**Primary Key:** `id`
**Foreign Key:** `user_id` → `users(id)` — if a user is deleted, all of his todos are deleted (CASCADE).
**Relation:** One user can have many todos (ONE-TO-MANY).
**Additional index:**
- `CREATE INDEX idx_todos_user_id ON todos(user_id)` — speed up filter WHERE user_id = $1
- `CREATE INDEX idx_todos_created_at ON todos(created_at)` — speeds up sort by date
- `CREATE INDEX idx_todos_user_manual ON todos(user_id, manual_index)` — speeds up ORDER BY manual_index per user

**One line example:**```
id: "f1e2d3c4-b5a6-7890-fedc-ba0987654321"
user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
text: "Learn Express.js today"
completed: false
created_at: "2026-01-15 10:00:00+07"
manual_index: 2
```

---

### Table `share_links`

| Nama Field | Data Type | Constraint | Description |
|------------|-----------|------------|-----------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik share link |
| todo_id | UUID | NOT NULL, FOREIGN KEY → todos(id) ON DELETE CASCADE | Shared todo |
| short_code | VARCHAR(20) | NOT NULL, UNIQUE | Unique short code (e.g.: "K3xP9mQr") |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Time link was created |

**Primary Key:** `id`
**Foreign Key:** `todo_id` → `todos(id)` — if a todo is deleted, the share link is also deleted.
**Relation:** One todo can have one share link (ONE-TO-ONE, enforced by application logic).
**Additional index:** `CREATE UNIQUE INDEX idx_share_links_code ON share_links(short_code)` — speeds up GET /s/:code lookups.

**One line example:**```
id: "c9d8e7f6-a5b4-3210-cba9-876543210fed"
todo_id: "f1e2d3c4-b5a6-7890-fedc-ba0987654321"
short_code: "K3xP9mQr"
created_at: "2026-01-15 10:05:00+07"
```

---

## 9. Security & Validation Plan

### Input Validation

| Fields | Layers | Rules | Error Message |
|-------|-------|--------|-------------|
| name (register) | Frontend (Yup) + Backend (validateBody) | Min 3 chars, max 100 chars, cannot be empty | "Name should be at least 3 characters" |
| email | Frontend (Yup) + Backend (validateBody) | Valid email format | "Enter a valid email" |
| password | Frontend (Yup) | Min 8 characters, uppercase, lowercase, numbers, special char | "Password does not meet requirements" |
| password (backend) | Backend only | Not empty; bcrypt verify | "Incorrect email or password" (generic) |
| text (todo) | Frontend (non-empty check) + Backend (validateBody) | Cannot be empty/whitespace | "Task text cannot be empty" |
| todo_id (share) | Backend (validateBody + ownership check) | Valid UUID + belonging to the logged in user | "Todo not found" |
| pattern (regex search) | Backend | The string cannot be empty; PostgreSQL will throw if invalid regex | "Invalid regex pattern" |

### Authentication

- **Mechanism:** JWT (JSON Web Token), signed with `JWT_SECRET`
- **Header format:** `Authorization: Bearer <token>`
- **Expiry:** 7 days (`expiresIn: '7d'`)
- **Protected:** All `/api/*` routes except `/api/auth/register`, `/api/auth/login`
- **Storage on frontend:** localStorage (via Zustand `persist`) — same as v1.5
- **Token not stored in backend** (stateless JWT) — logout only deletes the token on the client

### Environment Variables

| Variable | Value Example | Goals |
|----------|-------------|--------|
| PORTS | 4000 | Express listen server port |
| JWT_SECRET | random-string-length-min-32-char | Sign and verify JWT token |
| BCRYPT_ROUNDS | 10 | Number of bcrypt salt rounds (10 = security/performance balance) |
| BASE_URL | http:// localhost:4000 | Used to form a short URL (/s/:code) |
| FRONTEND_URL | http:// localhost:5173 | Target redirect after resolve short code |
| NODE_ENV | development / production | Determining the detail error level |

### CORS configuration

- **Origin allowed (development):** `http:// localhost:5173` (Vite dev server)
- **Origin allowed (production):** Your frontend domain URL
- **Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization
- **Credentials:** false (JWT in header, not cookie)

### Error Handling Strategy

- **AppError class:** Known errors (validation, not found, unauthorized) thrown as `new AppError(statusCode, errorCode, message)`
- **Global errorHandler middleware:** Catches all errors, differentiates AppError vs unexpected error
- **HTTP status used:**
  - 200 OK — request successful (GET, PUT successful)
  - 201 Created — new resource created (POST successful)
  - 302 Found — redirect (short URL)
  - 400 Bad Request — validation failed
  - 401 Unauthorized — token does not exist/invalid/expired
  - 403 Forbidden — valid token but no resource access (ownership check)
  - 404 Not Found — resource not found
  - 500 Internal Server Error — unexpected error

---

## 10. User Flow & Features

### All Frontend Pages

| Page | Path | Goals | Main Components |
|---------|------|--------|----------------|
| Sign In | /signin | Login to an existing account | Email+password form, link to Sign Up |
| Sign Up | /signup | Register a new account | Form name+email+password+confirm |
| Todo Dashboard | / | Todo management main dashboard | Header, TodoInput, Search, TodoList, TodoFooter, AnalyticsWidget |
| Shared Todo | /shared/:id | View shared (read-only) todos | Card todo info (text, status, date created) |

### User Journey from End to End

```
1. User opens the application → browser opens http:// localhost:5173
2. App.tsx check isLoggedIn in Zustand store (persist from localStorage)
3. isLoggedIn = false → auto redirect to /signin
4. User fills in email + password → click Sign In
5. Formik+Yup local validation → if failed show error in form
6. If valid → send POST /api/auth/login to backend
7. Backend verification → return JWT token + user info
8. Zustand save token + user to localStorage
9. useEffect detects isLoggedIn = true → navigate("/")
10. TodoPage mount → fetchTodos(userId) → GET /api/todos
11. Backend query todos WHERE user_id = $1 → return array todos
12. Zustand set todos → TodoList renders a to-do list
13. AnalyticsWidget mount → fetchAnalytics() → GET /api/analytics
14. Backend runs 3 SQL queries → return summary + trend + busiest days
15. AnalyticsWidget render card statistics
16. User adds todo → Enter → addTodo() → optimistic update → POST /api/todos
17. User click share icon in todo item → POST /api/share → get short URL
18. User copy link → send to friend → friend open URL
19. Browser request GET /s/ABC12345 to backend
20. Backend query share_links → redirect 302 to /shared/[todo_id]
21. SharedTodoPage fetch todo details (public endpoint) → show read-only
22. After 5 minutes of idle → useIdleTimer trigger logout → navigate(/signin)
23. User opens burger menu → click Sign Out → POST /api/auth/logout → navigate(/signin)
```

---

## 11. Backend Implementation Details

### 11.1 Routes

#### `src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { AuthController } from '../auth.controller';
import { validateBody } from '../middleware/validateBody';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// POST /api/auth/register — Register a new account
router.post(
'/register',
  validateBody(['name', 'email', 'password']),
AuthController.register
);

// POST /api/auth/login — Login, get JWT
router.post(
'/login',
  validateBody(['email', 'password']),
AuthController.login
);

// POST /api/auth/logout — Logout (protected)
router.post('/logout', authenticate, AuthController.logout);

export default router;
```

---

#### `src/routes/todo.routes.ts`

```typescript
import { Router } from 'express';
import { TodoController } from '../todo.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validateBody';

const router = Router();

// All todo routes require authentication
router.use(authenticate);

// IMPORTANT: The specific route MUST be defined BEFORE the route with the /:id parameter
// Otherwise, "completed" and "search" will be captured as :id

// GET /api/todos/search?q=keyword — Search by text
router.get('/search', TodoController.search);

// GET /api/todos/filter?status=active — Filter by status
router.get('/filter', TodoController.filterByStatus);

// GET /api/todos/regex?pattern=^Buy — Search by regex
router.get('/regex', TodoController.searchRegex);

// DELETE /api/todos/completed — Bulk delete completed todos
router.delete('/completed', TodoController.clearCompleted);

// PUT /api/todos/reorder — Bulk update manual_index
router.put('/reorder', validateBody(['updates']), TodoController.reorder);

// GET /api/todos — Fetch all user todos
router.get('/', TodoController.getAll);

// GET /api/todos/:id — Fetch one todo
router.get('/:id', TodoController.getOne);

// POST /api/todos — Create new todo
router.post('/', validateBody(['text']), TodoController.create);

// PUT /api/todos/:id — Update todo
router.put('/:id', TodoController.update);

// DELETE /api/todos/:id — Delete one todo
router.delete('/:id', TodoController.remove);

export default router;
```

---

#### `src/routes/share.routes.ts`

```typescript
import { Router } from 'express';
import { ShareController } from '../share.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validateBody';

const router = Router();

// POST /api/share — Create short link (protected)
router.post('/', authenticate, validateBody(['todo_id']), ShareController.create);

export default router;
```

---

#### `src/routes/analytics.routes.ts`

```typescript
import { Router } from 'express';
import { AnalyticsController } from '../analytics.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// GET /api/analytics — Fetch summary analytics (protected)
router.get('/', authenticate, AnalyticsController.getSummary);

export default router;
```

---

### 11.2 Controllers

#### `src/auth.routes.ts`

**AuthController.register**
- **Request received:** `req.body: { name, email, password }`
- **Validation before service:** Already done by `validateBody` middleware
- **Service called:** `authService.register(name, email, password)`
- **Response success:** `201 { message: "Registration successful", user: { id, name, email } }`
- **Possible error:** Email already registered → 409 Conflict

**AuthController.login**
- **Request received:** `req.body: { email, password }`
- **Service called:** `authService.login(email, password)`
- **Response success:** `200 { user: { id, name, email }, token: "eyJ..." }`
- **Possible errors:** User not found / wrong password → 401 (generic message, does not differentiate which one is wrong for security)

**AuthController.logout**
- **Request received:** Authorization header (validated by middleware)
- **Service called:** None (stateless logout — client simply removes token)
- **Success response:** `200 { message: "Logout successful" }`

---

#### `src/todo.routes.ts`

**TodoController.getAll**
- **Request received:** `req.userId` (from middleware), optional query params: `?sort=manual_index|created_at`
- **Service called:** `todoService.getAllByUser(userId)`
- **Response success:** `200 { todos: [...] }`

**TodoController.search**
- **Request received:** `req.userId`, `req.query.q: string`
- **Validation:** If `q` does not exist → return 400
- **Service called:** `todoService.searchByText(userId, q)`
- **Response success:** `200 { todos: [...], count: n }`

**TodoController.filterByStatus**
- **Request received:** `req.userId`, `req.query.status: 'active' | 'completed' | 'all'`
- **Service called:** `todoService.filterByStatus(userId, status)`
- **Successful response:** `200 { todos: [...] }`

**TodoController.searchRegex**
- **Request received:** `req.userId`, `req.query.pattern: string`
- **Service called:** `todoService.searchByRegex(userId, pattern)`
- **Successful response:** `200 { todos: [...] }`
- **Error:** PostgreSQL invalid regex → return 400 "Invalid regex pattern"

**TodoController.create**
- **Request received:** `req.userId`, `req.body: { text }`
- **Service called:** `todoService.create(userId, text)`
- **Successful response:** `201 { todo: newTodo }`

**TodoController.update**
- **Request received:** `req.userId`, `req.params.id`, `req.body: { text?, completed?, manual_index? }`
- **Service called:** `todoService.update(id, userId, updates)`
- **Response success:** `200 { todo: updatedTodo }`
- **Error:** Todo not found / not owned by user → 404 / 403

**TodoController.remove**
- **Request received:** `req.userId`, `req.params.id`
- **Service called:** `todoService.remove(id, userId)`
- **Successful response:** `200 { message: "Todo deleted" }`

**TodoController.clearCompleted**
- **Request received:** `req.userId`
- **Service called:** `todoService.clearCompleted(userId)`
- **Successful response:** `200 { message: "...", deletedCount: n }`

**TodoController.reorder**
- **Request received:** `req.userId`, `req.body.updates: Array<{ id: string, manual_index: number }>`
- **Service called:** `todoService.reorder(userId, updates)`
- **Successful response:** `200 { message: "Saved sequence" }`

---

#### `src/share.routes.ts`

**ShareController.create**
- **Request received:** `req.userId`, `req.body: { todo_id }`
- **Service called:** `shareService.createShortCode(todo_id, userId)`
- **Response success:** `201 { shortUrl: "http:// localhost:4000/s/K3xP9mQr", short_code: "K3xP9mQr" }`
- **Error:** Todo not found / not owned by user → 403

**ShareController.redirect**
- **Request received:** `req.params.code`
- **Service called:** `shareService.resolveCode(code)`
- **Successful response:** `res.redirect(302, FRONTEND_URL + "/shared/" + todo_id)`
- **Error:** Code not found → `res.redirect(302, FRONTEND_URL + "/not-found")`

---

#### `src/analytics.routes.ts`

**AnalyticsController.getSummary**
- **Request received:** `req.userId`
- **Service called:** `analyticsService.getSummary(userId)`
- **Successful response:** `200 { summary: {...}, dailyTrend: [...], busiestDays: [...] }`

---

### 11.3 Services — Complete Logic

#### `src/services/auth.service.ts`

**Function: `register(name, email, password)`**```
1. Query: SELECT id FROM users WHERE email = $1
   - If there is → throw AppError(409, "EMAIL_TAKEN", "Email already registered")
2. Password hash: bcrypt.hash(password, BCRYPT_ROUNDS)
3. INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email
4. return { id, name, email }

Errors handled:
  - Duplicate email → 409
  - DB error → propagate to errorHandler → 500
```

**Function: `login(email, password)`**```
1. Query: SELECT id, name, email, password_hash FROM users WHERE email = $1
   - None → throw AppError(401, "INVALID_CREDENTIALS", "Incorrect email or password")
2. bcrypt.compare(password, user.password_hash)
   - Doesn't match → throw AppError(401, "INVALID_CREDENTIALS", "Incorrect email or password")
     (IMPORTANT: same message for botha — does not leak registered email info)
3. jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
4. return { user: { id, name, email }, token }

Errors handled:
  - Wrong credentials → 401 (generic message)
  - DB error → 500
```

---

#### `src/services/todo.service.ts`

**Function: `getAllByUser(userId)`**```
Query:
SELECT id, user_id, text, completed, created_at, manual_index
FROM todos
WHERE user_id = $1
ORDER BY manual_index ASC

return: array of todos
```

**Function: `searchByText(userId, keyword)`**
```
Query:
SELECT * FROM todos
WHERE user_id = $1
AND text ILIKE $2
ORDER BY manual_index ASC

Parameters: [userId, `%${keyword}%`]
-- ILIKE = case-insensitive LIKE in PostgreSQL

return: { todos, count }
```

**Function: `filterByStatus(userId, status)`**
```
If status === 'all':
Query: SELECT * FROM todos WHERE user_id = $1 ORDER BY manual_index ASC
If status === 'active':
Query: SELECT * FROM todos WHERE user_id = $1 AND completed = false ORDER BY manual_index ASC
If status === 'completed':
Query: SELECT * FROM todos WHERE user_id = $1 AND completed = true ORDER BY manual_index ASC

return: todos
```

**Function: `searchByRegex(userId, pattern)`**
```
1. Try running the query:
SELECT * FROM todos
WHERE user_id = $1
AND text ~ $2 -- ~ operator = case-sensitive regex in PostgreSQL
ORDER BY manual_index ASC

Parameters: [userId, pattern]

2. If PostgreSQL throws error "invalid regular expression":
   throw AppError(400, "INVALID_REGEX", "Invalid regex pattern")

return: todos
```

**Function: `create(userId, text)`**
```
1. Calculate manual_index next:
   SELECT COALESCE(MAX(manual_index), -1) + 1 AS next_index
FROM todos WHERE user_id = $1

2. INSERT INTO todos (user_id, text, completed, created_at, manual_index)
   VALUES ($1, $2, false, NOW(), $3)
RETURNING *

   Parameters: [userId, text.trim(), nextIndex]

3. return newTodo
```

**Function: `update(id, userId, updates)`**
```
1. Ownership verification:
SELECT id FROM todos WHERE id = $1 AND user_id = $2
   - Not found → throw AppError(403, "FORBIDDEN", "Don't have access to this todo")

2. Build dynamic SET clause based on fields in updates:
   - If there is 'text' → SET text = $n
   - If there is 'completed' → SET completed = $n
   - If there is 'manual_index' → SET manual_index = $n
   
   (Do not update fields that are not sent)

3. UPDATE todos SET [fields] WHERE id = $1 RETURNING *

4. return updatedTodo
```

**Function: `remove(id, userId)`**
```
1. DELETE FROM todos WHERE id = $1 AND user_id = $2
   -- Ownership check is integrated in the WHERE clause
   
2. If rowCount === 0 → throw AppError(404, "NOT_FOUND", "Todo not found")

3. return { deleted: true }
```

**Function: `clearCompleted(userId)`**
```
1. DELETE FROM todos WHERE user_id = $1 AND completed = true
2. return { deletedCount: result.rowCount }
```

**Function: `reorder(userId, updates)`**
```
-- updates = [{ id: "uuid1", manual_index: 0 }, { id: "uuid2", manual_index: 1 }, ...]
-- Must be in SQL TRANSACTION because it updates many rows at once

1. const client = await pool.connect()

2. try:
   await client.query('BEGIN')
   
   for setiap { id, manual_index } dalam updates:
     await client.query(
'UPDATE todos SET manual_index = $1 WHERE id = $2 AND user_id = $3',
[manual_index, id, userId]
     )
   
   await client.query('COMMIT')
   
3. catch (error):
   await client.query('ROLLBACK')
throw error
   
4. finally:
client.release() -- MANDATORY: return connection to pool

return: { success: true }
```

---

#### `src/services/share.service.ts`

**Function: `createShortCode(todo_id, userId)`**
```
1. Verify userId's todo:
SELECT id FROM todos WHERE id = $1 AND user_id = $2
   - Not found → throw AppError(403, "FORBIDDEN", "Todo not found")

2. Check if there is already a short_code for this todo:
SELECT short_code FROM share_links WHERE todo_id = $1
   - Already exists → return { shortUrl: BASE_URL + "/s/" + existingCode, short_code: existingCode }

3. Generate unique code:
Loops:
     code = generateCode(8)  — 8 random alphanumeric characters
Check: SELECT id FROM share_links WHERE short_code = $1
     If not found → break loop (unique code)
     If exists → loop lagi (collision, generate ulang)

4. INSERT INTO share_links (todo_id, short_code) VALUES ($1, $2) RETURNING *

5. return { shortUrl: BASE_URL + "/s/" + code, short_code: code }
```

**Function: `resolveCode(code)`**
```
1. SELECT sl.todo_id, t.user_id
FROM share_links sl
INNER JOIN todos t ON sl.todo_id = t.id
WHERE sl. short_code = $1

2. Not found → return null
3. Found → return { todo_id }
```

---

#### `src/services/analytics.service.ts`

**Function: `getSummary(userId)`**

```
-- Query 1: General summary (aggregate COUNT + FILTER)
SELECT
  COUNT(*)                                          AS total,
  COUNT(*) FILTER (WHERE completed = true)          AS completed_count,
  COUNT(*) FILTER (WHERE completed = false)         AS active_count,
  ROUND(
    COUNT(*) FILTER (WHERE completed = true)::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                 AS completion_rate
FROM todos
WHERE user_id = $1

-- Analogy: "The manager asks for a report: how many total orders, how many completed, how many pending,
-- what percent complete?"
```

```
-- Query 2: Daily trend of the last 7 days (GROUP BY DATE)
SELECT
  DATE(created_at AT TIME ZONE 'Asia/Jakarta')      AS day,
  COUNT(*)                                          AS created,
  COUNT(*) FILTER (WHERE completed = true)          AS completed_on_day
FROM todos
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at AT TIME ZONE 'Asia/Jakarta')
ORDER BY day ASC

-- Analogy: "Report for the last 7 days: what days did you make a lot of todos, what days did you finish a lot?"
```

```
-- Query 3: Busiest days (GROUP BY + HAVING)
SELECT
  DATE(created_at AT TIME ZONE 'Asia/Jakarta')      AS day,
  COUNT(*)                                          AS total_created
FROM todos
WHERE user_id = $1
GROUP BY DATE(created_at AT TIME ZONE 'Asia/Jakarta')
HAVING COUNT(*) >= 3
ORDER BY total_created DESC
LIMIT 5

-- Analogy: "Show days where you made 3 or more todos (busiest days)"
-- HAVING = filter AFTER GROUP BY (different from WHERE which filters BEFORE GROUP BY)
```

```
-- All 3 queries run in parallel using Promise.all([q1, q2, q3])
return {
summary: rows from Query 1,
dailyTrend: rows from Query 2,
busiestDays: rows from Query 3
}
```

---

### 11.4 Middleware — Code Complete

#### `src/middleware/authenticate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Extend Express Request type so that TypeScript knows there is a req.userId
declare global {
  namespace Express {
    interface Request {
userId: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Read the Authorization header
  const authHeader = req.headers.authorization;
  
// Check the "Bearer <token>" format
  if (!authHeader | !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication token missing');
  }
  
  const token = authHeader.split(' ')[1]; // Take the part after "Bearer "
  
  try {
    // Verify and decode JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
req.userId = decoded.userId; // Save userId to request object
    next(); // Continue to controller
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
throw new AppError(401, 'TOKEN_EXPIRED', 'Your session has expired, please re-login');
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token');
  }
};
```

---

#### `src/middleware/validateBody.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

// Factory function: accepts an array of required fields
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of requiredFields) {
      const value = req.body[field];
      // Check: the field exists AND is not an empty string/whitespace
      if (value === undefined | value === null | String(value).trim() === '') {
        throw new AppError(400, 'VALIDATION_ERROR', `Field '${field}' required filled`);
      }
    }
    next();
  };
};
```

---

#### `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
err: Error,
req: Request,
res: Response,
next: NextFunction // This parameter should be 4 for Express to recognize this as an error handler
) => {
  // If the error is an AppError (known business error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
error: err.code,
message: err. message,
    });
  }
  
  // Unexpected errors — don't leak details to clients
  console.error('Unexpected error:', err); // Log to server console
  return res.status(500).json({
error: 'INTERNAL_ERROR',
message: 'An error occurred on the server',
  });
};
```

---

#### `src/middleware/errorHandler.ts`

```typescript
export class AppError extends Error {
statusCode: number;
code: string;
  
  constructor(statusCode: number, code: string, message: string) {
    super(message);
this.statusCode = statusCode;
this.code = code;
this.name = 'AppError';
  }
}
```

---

#### `src/services/share.service.ts`

```typescript
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateCode = (length: number = 8): string => {
let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
};
```

---

#### `src/config/db.ts`

```typescript
import { Pool } from 'pg';
import { env } from './env';

// Pool = collection of database connections that are recycled
// Analogy: instead of each order opening a new warehouse door, keep 10 keys on rotation
export const pool = new Pool({
connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
max: 10, // Max 10 concurrent connections
idleTimeoutMillis: 30000, // Idle connections > 30s will be closed
});

// Test connection when server starts
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});
```

---

#### `src/config/env.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

// Validate all required env variables
const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} should be filled in .env file`);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT!, 10),
DATABASE_URL: process.env.DATABASE_URL!,
JWT_SECRET: process.env.JWT_SECRET!,
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS | '10', 10),
BASE_URL: process.env.BASE_URL | 'http://localhost:4000',
FRONTEND_URL: process.env.FRONTEND_URL | 'http://localhost:5173',
NODE_ENV: process.env.NODE_ENV | 'development',
};
```

---

#### `src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import shareRoutes from './routes/share.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Global Middleware ──
app.use(cors({
origin: env.FRONTEND_URL, // Only allow from frontend URLs
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());           // Parse JSON request body
app.use(morgan('dev'));             // Log each request to console (method, path, status, time)

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/analytics', analyticsRoutes);

// Redirect route (not under /api because accessed directly by browser)
import shareRedirectRoutes from './routes/share.redirect.routes';  // GET /s/:code
app.use('/s', shareRedirectRoutes);

// 404 handler for missing routes
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
});

// ── Global Error Handler (MUST BE LAST) ──
app.use(errorHandler);

export default app;
```

---

#### `src/server.ts`

```typescript
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Server running at http:// localhost:${env.PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});
```

---

## 12. Frontend Implementation Details

### 12.1 Files that Need to be Updated/Created

#### UPDATE: `src/config/api.ts` (Replace `src/config/backendless.ts`)

```typescript
// src/config/api.ts — REPLACE backendless.ts content with this

// Base URL to our Express backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL | 'http:// localhost:4000';
```

---

#### UPDATE: `src/lib/axios.ts`

```typescript
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create Axios instance with our backend base URL
const apiClient = axios.create({
baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Inject JWT Token ──
// Every outgoing request, automatically add Authorization header
apiClient.interceptors.request.use((config) => {
  // Dynamic import to avoid circular dependencies
  const { useAuthStore } = require('../store/useAuthStore');
  const token = useAuthStore.getState().userToken;
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    // CHANGES from v1.5: 'user-token' → 'Authorization: Bearer...'
    // This is standard JWT format used by Express + jsonwebtoken
  }
  return config;
});

// ── Response Interceptor: Handle 401/403 ──
apiClient.interceptors.response.use(
  (response) => response, // 2xx: direct return
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') |
      error.config?.url?.includes('/auth/register');
    
// If 401/403 is not from endpoint login/register → session expired
    if ((error.response?.status === 401 | error.response?.status === 403) && !isAuthEndpoint) {
      const { useAuthStore } = require('../store/useAuthStore');
      useAuthStore.getState().logout(); // Clear auth state
      window.location.href = '/signin'; // Hard redirect (interceptor is outside React tree)
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

#### REWRITE: `src/services/authService.ts`

```typescript
import apiClient from '../lib/axios';

// Return type from our backend endpoint (not Backendless anymore)
interface LoginResponse {
  user: { id: string; name: string; email: string };
token: string;
}

interface RegisterResponse {
message: string;
  user: { id: string; name: string; email: string };
}

export const authService = {
  // Register a new account
  register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await apiClient.post('/api/auth/register', { name, email, password });
    return response.data;
  },
  
  // Login — return user + JWT token
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
    // response.data = { user: { id, name, email }, token: "eyJ..." }
  },
  
  // Logout — stateless server, just remove token on client
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
    // The token will be removed from store by useAuthStore after this
  },
};
```

---

#### REWRITE: `src/services/todoService.ts`

```typescript
import apiClient from '../lib/axios';
import { Todo } from '../types/types';

export const todoService = {
  // Fetch all todos belonging to the logged in user
  fetchTodos: async (): Promise<Todo[]> => {
    const response = await apiClient.get('/api/todos');
    return response.data.todos;
    // CHANGE: no need to send ownerId anymore — backend reads from JWT
  },
  
  // Create new todo
  createTodo: async (text: string): Promise<Todo> => {
    const response = await apiClient.post('/api/todos', { text });
    return response.data.todo;
  },
  
  // Update todo (text / completed / manual_index)
  updateTodo: async (id: string, updates: Partial<Pick<Todo, 'text' | 'completed' | 'manual_index'>>): Promise<Todo> => {
    const response = await apiClient.put(`/api/todos/${id}`, updates);
    return response.data.todo;
  },
  
  // Delete one todo
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/todos/${id}`);
  },
  
  // Delete all completed todos
  clearCompleted: async (): Promise<number> => {
    const response = await apiClient.delete('/api/todos/completed');
    return response.data.deletedCount;
  },
  
  // Reorder (bulk update manual_index)
  reorderTodos: async (updates: Array<{ id: string; manual_index: number }>): Promise<void> => {
    await apiClient.put('/api/todos/reorder', { updates });
  },
};
```

---

#### NEW: `src/services/shareService.ts`

```typescript
import apiClient from '../lib/axios';

export const shareService = {
  // Create or fetch short link for specific todo
  createShareLink: async (todo_id: string): Promise<{ shortUrl: string; short_code: string }> => {
    const response = await apiClient.post('/api/share', { todo_id });
    return response.data;
  },
};
```

---

#### NEW: `src/services/analyticsService.ts`

```typescript
import apiClient from '../lib/axios';
import { AnalyticsSummary } from '../types/types';

export const analyticsService = {
  // Fetch summary analytics of user's todos
  fetchAnalytics: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get('/api/analytics');
    return response.data;
  },
};
```

---

#### UPDATE: `src/types/types.ts`

Add new types, update changed types:

```typescript
// ── Todo Types (UPDATED) ──

interface Todo {
  id: string;           // REPLACE from objectId → id (UUID from PostgreSQL)
  user_id: string;      // REPLACE from ownerId → user_id (DB column name)
text: string;
completed: boolean;
  created_at: string;   // REPLACE from number (timestamp) → string (ISO date from PostgreSQL)
manual_index: number;
}

// ── Auth Types (UPDATED) ──

interface AppUser {     // REPLACE from BackendlessUser → AppUser
id: string;          // REPLACE from objectId → id
name: string;
email: string;
  // No more 'user-token' here — token is stored separately in userToken state
}

// ── Auth Store (UPDATED) ──
interface AuthState {
user: AppUser | null;    // REPLACE BackendlessUser → AppUser
  userToken: string | null; // JWT token (format changed, but state name is same)
isLoggedIn: boolean;
isLoading: boolean;
error: string | null;
}

// ── Analytics Types (NEW) ──

interface AnalyticsSummaryRow {
total: number;
completed_count: number;
active_count: number;
  completion_rate: number; // Percentage (0-100)
}

interface DailyTrendRow {
day: string;             // Format "2026-01-15"
created: number;
completed_on_day: number;
}

interface BusiestDayRow {
day: string;
total_created: number;
}

interface AnalyticsSummary {
summary: AnalyticsSummaryRow;
dailyTrend: DailyTrendRow[];
busiestDays: BusiestDayRow[];
}

// ── Share Link Types (NEW) ──

interface ShareLinkResponse {
shortUrl: string;
short_code: string;
}
```

---

#### UPDATE: `src/store/useAuthStore.ts`

Parts that need to be changed:

```typescript
// BEFORE (Backendless):
signIn: async (email, password) => {
  const user = await authService.login({ email, password });
  set({ user, userToken: user['user-token'], isLoggedIn: true, isLoading: false });
},

// AFTER (Express + JWT):
signIn: async (email, password) => {
  set({ isLoading: true, error: null });
  try {
    const { user, token } = await authService.login(email, password);
    // CHANGE: backend return { user, token } not BackendlessUser with user-token in it
    set({ user, userToken: token, isLoggedIn: true, isLoading: false });
  } catch (err: any) {
    set({ error: err.response?.data?.message | 'Login failed', isLoading: false });
  }
},

// signUp: still returns boolean, logic is the same, only passed data changes
signUp: async (name, email, password) => {
  set({ isLoading: true, error: null });
  try {
    await authService.register(name, email, password);
    set({ isLoading: false });
    return true;
  } catch (err: any) {
    set({ error: err.response?.data?.message | 'Registration failed', isLoading: false });
    return false;
  }
},
```

---

#### UPDATE: `src/store/useTodoStore.ts`

Parts that need to be changed:

```typescript
// BEFORE (Backendless):
fetchTodos: async (ownerId) => {
  const todos = await todoService.fetchTodos(ownerId);
  // ...
},

addTodo: async () => {
  const currentUserId = useAuthStore.getState().user?.objectId;
  // ...
  const optimisticTodo: Todo = {
objectId: tempId, // ← objectId
ownerId: currentUserId, // ← ownerId
    // ...
  }
  const newTodo = await todoService.createTodo(text);
  // Replace tempTodo with newTodo using objectId
}

// AFTER (Express + JWT):
fetchTodos: async () => {
  // NO need for ownerId anymore — backend reads from JWT token
  set({ isLoading: true, error: null });
  try {
    const todos = await todoService.fetchTodos();
    set({ todos, isLoading: false });
  } catch (error) {
    set({ error: 'Failed to load todos', isLoading: false });
  }
},

addTodo: async () => {
  const { newInput, todos } = get();
  if (!newInput.trim()) return;
  
  const tempId = 'temp-' + Date.now(); // ID sementara before dapat from server
  const optimisticTodo: Todo = {
id: tempId, // ← REPLACE from objectId → id
    user_id: '',         // ← REPLACE from ownerId → user_id (no need to fill in FE)
    text: newInput.trim(),
completed: false,
    created_at: new Date().toISOString(),
manual_index: todos.length,
  };
  
  const snapshot = todos;
  set({ todos: [...todos, optimisticTodo], newInput: '', isSyncing: true });
  
  try {
    const newTodo = await todoService.createTodo(newInput.trim());
    // Replace tempTodo using id (not objectId)
    set(state => ({
      todos: state.todos.map(t => t.id === tempId ? newTodo : t),
isSyncing: false,
    }));
  } catch {
    set({ todos: snapshot, isSyncing: false, error: 'Failed to save todo' });
  }
},

// All actions using objectId → replace with id:
toggleTodo: async (id) => { /* replace objectId → id */ },
updateTodo: async (id, text) => { /* replace objectId → id */ },
removeTodo: async (id) => { /* replace objectId → id */ },
```

---

#### UPDATE: `src/pages/TodoPage.tsx`

```typescript
// Add import
import { AnalyticsWidget } from '../components/analytics/AnalyticsWidget';
import { analyticsService } from '../services/analyticsService';
import { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../types/types';

// In TodoPage component:
const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

useEffect(() => {
  if (user) {
    // CHANGE: no need to send user.objectId — backend read from JWT
    store.fetchTodos();
    
    // NEW: fetch analytics
    analyticsService.fetchAnalytics()
      .then(setAnalytics)
      .catch(console.error);
  }
}, [user]);

// CHANGE in JSX: add AnalyticsWidget after MobileFilterBar
// and change fetchTodos() called without arguments:
return (
<AppShell>
    {/* ... existing layout ... */}
    
    {/* NEW: Analytics Widget */}
    {analytics && <AnalyticsWidget data={analytics} />}
    
    {/* ... rest of layout ... */}
</AppShell>
);
```

---

#### NEW: `src/components/analytics/AnalyticsWidget.tsx`

```typescript
import React from 'react';
import { AnalyticsSummary } from '../../types/types';

interface Props {
data: AnalyticsSummary;
}

export const AnalyticsWidget: React.FC<Props> = ({ data }) => {
  const { summary, dailyTrend, busiestDays } = data;
  
  return (
<div className="mt-4 rounded-xl bg-white dark:bg-gray-800 shadow p-4">
<h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
📊 Task Statistics
</h2>
      
      {/* Summary */}
<div className="grid grid-cols-3 gap-3 mb-4">
<div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{summary.total}</div>
<div className="text-xs text-gray-400">Total</div>
</div>
<div className="text-center">
          <div className="text-2xl font-bold text-green-500">{summary.completed_count}</div>
<div className="text-xs text-gray-400">Completed</div>
</div>
<div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{summary.active_count}</div>
<div className="text-xs text-gray-400">Active</div>
</div>
</div>
      
      {/* Progress bar completion rate */}
<div className="mb-4">
<div className="flex justify-between text-xs text-gray-400 mb-1">
<span>Completion rate</span>
          <span>{summary.completion_rate}%</span>
</div>
<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
<div
className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${summary.completion_rate}%` }}
/>
</div>
</div>
      
      {/* Tren 7 hari (simple mini bar chart) */}
      {dailyTrend.length > 0 && (
<div>
<div className="text-xs text-gray-400 mb-2">Last 7 days trend</div>
<div className="flex items-end gap-1 h-12">
            {dailyTrend.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-0.5">
<div
className="w-full bg-blue-400 rounded-sm"
                  style={{ height: `${Math.max(4, (day.created / Math.max(...dailyTrend.map(d => d.created))) * 40)}px` }}
                  title={`${day.day}: ${day.created} created`}
/>
</div>
            ))}
</div>
<div className="flex gap-1 mt-1">
            {dailyTrend.map((day) => (
              <div key={day.day} className="flex-1 text-center text-[10px] text-gray-400">
                {new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' })}
</div>
            ))}
</div>
</div>
      )}
</div>
  );
};
```

---

#### UPDATE: `src/components/todo/TodoItem.tsx`

Add share button:

```typescript
// Add import
import { shareService } from '../../services/shareService';
import { useState } from 'react';

// In TodoItem component:
const [isSharing, setIsSharing] = useState(false);

const handleShare = async () => {
  if (isSharing) return;
  setIsSharing(true);
  try {
    const { shortUrl } = await shareService.createShareLink(todo.id);
    await navigator.clipboard.writeText(shortUrl);
    // Show quick feedback (can use local state)
    alert(`Link copied: ${shortUrl}`); // Or use toast notification
  } catch (error) {
    console.error('Failed to create share link:', error);
  } finally {
    setIsSharing(false);
  }
};

// In JSX, add share button next to delete button:
<button
  onClick={handleShare}
  disabled={isSharing}
aria-label="Share todo"
className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-500"
>
🔗
</button>
```

---

#### NEW: `src/pages/SharedTodoPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../lib/axios';

interface SharedTodo {
id: string;
text: string;
completed: boolean;
created_at: string;
}

export const SharedTodoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [todo, setTodo] = useState<SharedTodo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch todo details (public endpoint — no auth needed)
    apiClient.get(`/api/todos/shared/${id}`)
      .then(res => setTodo(res.data.todo))
      .catch(() => setError('Todo not found or link is inactive'))
      .finally(() => setLoading(false));
  }, [id]);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!todo) return null;
  
  return (
<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
<div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-md w-full">
<div className="text-xs text-gray-400 mb-2">📌 Shared todo</div>
        <div className={`text-lg font-medium mb-4 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
          {todo.text}
</div>
<div className="text-sm text-gray-400">
          Status: {todo.completed ? '✅ Completed' : '⏳ Pending'}
</div>
<div className="text-sm text-gray-400 mt-1">
          Created: {new Date(todo.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
</div>
</div>
</div>
  );
};
```

---

#### UPDATE: `src/App.tsx`

```typescript
// Add new route
import { SharedTodoPage } from './pages/SharedTodoPage';

// Inside Routes:
<Route path="/shared/:id" element={<SharedTodoPage />} />
// Note: this route DOES NOT need to be protected — anyone can view shared points
```

---

#### UPDATE: `.env` (Frontend)

```env
# DELETE:
VITE_BACKENDLESS_APP_ID=...
VITE_BACKENDLESS_API_KEY=...

# ADD:
VITE_API_BASE_URL=http:// localhost:4000
```

---

### 12.2 State Management — Change Table

| State Variables | Type | It's On | Updated from v1.5 |
|----------------|------|--------|-----------------|
| user | AppUser\ | null | useAuthStore | REPLACE BackendlessUser → AppUser (field objectId → id) |
| userToken | string \ | null | useAuthStore | Same, but the current value is JWT not Backendless token |
| isLoggedIn | boolean | useAuthStore | Unchanged |
| todos | Todo[] | useTodoStore | Fields objectId → id, ownerId → user_id |
| fetchTodos | function | useTodoStore | No need for ownerId arguments anymore |
| analytics | AnalyticsSummary\ | null | TodoPage local state | NEW |

---

## 13. Database Setup Guide — Local PostgreSQL

### Step 1: Install PostgreSQL (Windows)

```
1. Download installer from: https:// www.postgresql.org/download/windows/
2. Click "Download the installer" (select version 16.x)
3. Run the installer:
   - Password for superuser 'postgres': note this password carefully!
   - Port: 5432 (default, leave it)
   - Locale: Indonesian (Indonesia) or Default locale
4. Check "Stack Builder" → click Next
   - In Stack Builder, you can skip (click Cancel)
5. After the installation is complete, PostgreSQL runs as a Windows Service automatically
```

### Step 2: Open pgAdmin or Use psql

**Method 1 — Via psql (command line):**
```bash
# Open Command Prompt, type:
psql -U postgres
# Enter the password you created during installation

# You will be prompted with PostgreSQL:
postgres=#
```

**Method 2 — Via pgAdmin (PostgreSQL's default GUI):**
```
1. Open pgAdmin from Start Menu
2. Master Password: create a new password for pgAdmin (different from postgres password)
3. In the left pane: Servers → right click → Register → Server
   - Name: "Local PostgreSQL"
   - Host: localhost, Port: 5432, Username: postgres, Password: [password install]
```

### Step 3: Create a Database

```sql
-- In psql or pgAdmin Query Tool:
CREATE DATABASE todoapp;

-- Verification:
\l -- or: SELECT datname FROM pg_database;
-- You will see 'todoapp' in the list

-- Move to the new database:
\c todoapp
```

### Step 4: Setup DBeaver

```
1. Download DBeaver Community from: https:// dbeaver.io/download/
2. Install and open DBeaver
3. Click the "New Database Connection" button (plug + icon in the toolbar)
4. Select PostgreSQL → click Next
5. Connection contents:
   - Host: localhost
   - Port: 5432
   - Database: todoapp
   - Username: postgres
   - Password: [PostgreSQL install password]
6. Click "Test Connection" → "Connected" should be displayed
7. Click Finish
8. In the left pane: todoapp → Schemas → public → Tables
   (currently empty, we will create it in the next step)
```

### Step 5: Run SQL Schema

In DBeaver, right click on database "todoapp" → SQL Editor → Open SQL Script, then paste and run the following SQL **in order**:

```sql
-- ═══════════════════════════════════════
-- FILE: sql/001_create_users.sql
-- ═══════════════════════════════════════

-- Enable extension to generate UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index to speed up login query (find user by email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Table comments for documentation
COMMENT ON TABLE users IS 'Todo app user account table';
COMMENT ON COLUMN users.id IS 'UUID auto-generated, primary key';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt result, DO NOT store plain text';
```

```sql
-- ═══════════════════════════════════════
-- FILE: sql/002_create_todos.sql
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS todos (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
text TEXT NOT NULL,
completed BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
manual_index INTEGER NOT NULL DEFAULT 0
);

-- Index for general queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id    ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_user_manual ON todos(user_id, manual_index);

COMMENT ON TABLE todos IS 'Task/todo table per user';
COMMENT ON COLUMN todos.user_id IS 'FK to users.id; CASCADE DELETE';
COMMENT ON COLUMN todos.manual_index IS 'Drag-and-drop order position, 0-based';
```

```sql
-- ═══════════════════════════════════════
-- FILE: sql/003_create_share_links.sql
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS share_links (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id     UUID          NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  short_code  VARCHAR(20)   NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for quick lookup during redirect
CREATE UNIQUE INDEX IF NOT EXISTS idx_share_links_code ON share_links(short_code);
CREATE INDEX IF NOT EXISTS idx_share_links_todo_id ON share_links(todo_id);

COMMENT ON TABLE share_links IS 'Short URL for sharing public todo';
COMMENT ON COLUMN share_links.short_code IS '8-character unique alphanumeric code';
```

```sql
-- ═══════════════════════════════════════
-- FILE: sql/004_seed_example.sql (OPTIONAL — for testing)
-- ═══════════════════════════════════════
-- Run ONLY in development environment, NOT in production

-- Example insert user (password = "Test@1234", already hashed with bcrypt)
INSERT INTO users (name, email, password_hash) VALUES
  ('Test User', 'test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG');

-- Get newly created user id to seed todos
-- (Run these two queries separately)
INSERT INTO todos (user_id, text, completed, manual_index) 
SELECT id, 'Learn Express.js', false, 0 FROM users WHERE email = 'test@example.com';

INSERT INTO todos (user_id, text, completed, manual_index)
SELECT id, 'PostgreSQL Setup', true, 1 FROM users WHERE email = 'test@example.com';
```

### Step 6: Verify in DBeaver

```
1. In the left pane of DBeaver, right-click Tables → Refresh
2. You must look at 3 tables: users, todos, share_links
3. Right click the users table → View Data → look at the columns
4. Run a test query:
SELECT * FROM users;       -- Must be empty (or have 1 row if running seed)
SELECT * FROM todos;
SELECT * FROM share_links;
```

### Step 7: Create a Backend `.env` File

```env
# backend/.env

PORT=4000
DATABASE_URL=postgresql:// postgres:YOUR_PASSWORD_HERE@localhost:5432/todoapp
JWT_SECRET=this-should be-random-string-length-minimum-32-characters-replace-this
BCRYPT_ROUNDS=10
BASE_URL=http:// localhost:4000
FRONTEND_URL=http:// localhost:5173
NODE_ENV=development
```

---



```
## 15. Step by Step Implementation Guide

### PHASE 1: Setup Backend Project

---

#### Step 1 — Initialize Backend Project

```bash
# Create a backend folder (outside the frontend folder)
mkdir backend
cd backend

# Initialize npm
npm init -y

# Install main dependencies
npm install express cors dotenv morgan pg bcryptjs jsonwebtoken

# Install TypeScript and type definitions
npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan @types/pg @types/bcryptjs @types/jsonwebtoken nodemon

# Why each package:
# express → web server framework
# cors → CORS handle for requests from frontend
# dotenv → read .env file
# morgan → HTTP request logger (very helpful with debugging)
# pg → PostgreSQL driver (raw SQL, no ORM)
# bcryptjs → password hash (pure JS, easier to install than native bcrypt)
# jsonwebtoken → create and verify JWT token
```

---

#### Step 2 — Configure TypeScript

```bash
# Generate tsconfig.json
npx tsc --init
```

Edit `tsconfig.json` to:

```json
{
  "compilerOptions": {
"target": "ES2020",
"module": "commonjs",
"lib": ["ES2020"],
"outDir": "./dist",
"rootDir": "./src",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"forceConsistentCasingInFileNames": true,
"resolveJsonModule": true
  },
"include": ["src/**/*"],
"exclude": ["node_modules", "dist"]
}
```

---

#### Step 3 — Create a Folder Structure

```bash
# Create all folders at once

# Create main files
touch src/server.ts src/server.ts
touch src/config/db.ts src/config/env.ts
touch src/middleware/authenticate.ts src/middleware/validateBody.ts src/middleware/errorHandler.ts
touch src/middleware/errorHandler.ts src/services/share.service.ts
touch src/routes/auth.routes.ts src/routes/todo.routes.ts src/routes/share.routes.ts src/routes/analytics.routes.ts
touch src/auth.routes.ts src/todo.routes.ts src/share.routes.ts src/analytics.routes.ts
touch src/services/auth.service.ts src/services/todo.service.ts src/services/share.service.ts src/services/analytics.service.ts
touch sql/001_create_users.sql sql/002_create_todos.sql sql/003_create_share_links.sql sql/004_seed_example.sql
touch .env .env.example .gitignore nodemon.json
```

---

#### Step 4 — Configure Nodemon

Create `nodemon.json`:

```json
{
"watch": ["src"],
"ext": "ts,json",
"ignore": ["src/**/*.test.ts"],
"exec": "ts-node src/server.ts"
}
```

Update `package.json` scripts:

```json
{
  "scripts": {
"dev": "nodemon",
"build": "tsc",
"start": "node dist/server.js",
"typecheck": "tsc --noEmit"
  }
}
```

---

#### Step 5 — Create `.env` and `.env.example` Files

`.env` (do not commit to git!):
```env
PORT=4000
DATABASE_URL=postgresql:// postgres:YOUR_PASSWORD@localhost:5432/todoapp
JWT_SECRET=replace-with-random-string-length-at-least-32-characters
BCRYPT_ROUNDS=10
BASE_URL=http:// localhost:4000
FRONTEND_URL=http:// localhost:5173
NODE_ENV=development
```

`.env.example` (safe to commit):
```env
PORT=4000
DATABASE_URL=postgresql:// USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
BCRYPT_ROUNDS=10
BASE_URL=http:// localhost:4000
FRONTEND_URL=http:// localhost:5173
NODE_ENV=development
```

`.gitignore`:
```
node_modules/
dist/
.env
*.log
```

---

#### Step 6 — Write All Config Files, Utils, Middleware

Write the following files according to the code explained in Section 11:

1. `src/middleware/errorHandler.ts` — Custom Error class
2. `src/services/share.service.ts` — Alphanumeric code generator
3. `src/config/env.ts` — Load and validate env vars
4. `src/config/db.ts` — pg.Pool setup
5. `src/middleware/authenticate.ts` — JWT verification
6. `src/middleware/validateBody.ts` — Field validation factory
7. `src/middleware/errorHandler.ts` — Global error handler

---

#### Step 7 — Write Services

Write in this order (because there are dependencies between services):

1. `src/services/auth.service.ts`
2. `src/services/todo.service.ts`
3. `src/services/share.service.ts`
4. `src/services/analytics.service.ts`

---

#### Step 8 — Write Controllers

1. `src/auth.routes.ts`
2. `src/todo.routes.ts`
3. `src/share.routes.ts`
4. `src/analytics.routes.ts`


```typescript
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(201).json({ message: 'Registration successful', user: result });
    } catch (error) {
      next(error); // Throw to errorHandler middleware
    }
  },
  
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },
};
```

---

#### Step 9 — Write Routes and server.ts / server.ts

1. `src/routes/auth.routes.ts`
2. `src/routes/todo.routes.ts`
3. `src/routes/share.routes.ts`
4. `src/routes/analytics.routes.ts`

Also create a special `src/routes/share.redirect.routes.ts` for redirect /s/:code:

```typescript
// src/routes/share.redirect.routes.ts
import { Router } from 'express';
import { ShareController } from '../share.controller';

const router = Router();
router.get('/:code', ShareController.redirect);
export default router;
```

5. `src/server.ts` — As per code in Section 11
6. `src/server.ts` — As per code in Section 11

---

#### Step 10 — Backend Test Running

```bash
# Make sure PostgreSQL is running and the database has been created
# Make sure the .env is filled in correctly

# Start server
npm run dev

# Expected output:
# ✅ Database connected
# 🚀 Server running at http:// localhost:4000
```

**Test with curl or Postman/Insomnia:**

```bash
# Test register
curl -X POST http:// localhost:4000/api/auth/register\
  -H "Content-Type: application/json" \
  -d '{"name":"Awan","email":"awan@test.com","password":"Test@1234"}'
# Expected: 201 { message: "Registration successful", user: {...} }

# Test login
curl -X POST http:// localhost:4000/api/auth/login\
  -H "Content-Type: application/json" \
  -d '{"email":"awan@test.com","password":"Test@1234"}'
# Expected: 200 { user: {...}, token: "eyJ..." }
# COPY TOKEN for next test

# Test get todos (use token from login)
curl http://localhost:4000/api/todos\
  -H "Authorization: Bearer eyJ..."
# Expected: 200 { todos: [] }

# Test create todo
curl -X POST http://localhost:4000/api/todos\
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"text":"My first todo"}'
# Expected: 201 { todo: { id, text, ... } }

# Test analytics
curl http://localhost:4000/api/analytics\
  -H "Authorization: Bearer eyJ..."
# Expected: 200 { summary: {...}, dailyTrend: [...], busiestDays: [...] }
```

---

### PHASE 2: Frontend Update

---

#### Step 11 — Remove Backendless Dependencies from Frontend

```bash
# In the frontend folder
cd ../frontend # or the name of your frontend folder

# Check whether there are any Backendless packages that need to be removed
# (Backendless v1.5 usually only uses REST API via Axios, not SDK)
# If there is 'backendless' in package.json:
npm uninstall backendless
```

---

#### Step 12 — Update Frontend Environment Files

```bash
# Open .env in the frontend folder
# Delete VITE_BACKENDLESS_* rows
# Add:
echo "VITE_API_BASE_URL=http:// localhost:4000" >> .env
```

---

#### Step 13 — Update / Create Frontend Files (Recommended Order)

Update the files **in this order** to avoid import errors:

1. `src/config/api.ts` — Create a new file (can directly delete backendless.ts)
2. `src/types/types.ts` — Update types
3. `src/lib/axios.ts` — Update interceptor (Authorization header)
4. `src/services/authService.ts` — Rewrite call new endpoint
5. `src/services/todoService.ts` — Rewrite call new endpoint
6. `src/services/shareService.ts` — Create new
7. `src/services/analyticsService.ts` — Create new
8. `src/store/useAuthStore.ts` — Update field names
9. `src/store/useTodoStore.ts` — Update field names + fetchTodos without arguments
10. `src/components/analytics/AnalyticsWidget.tsx` — Create new
11. `src/components/todo/TodoItem.tsx` — Add share button
12. `src/pages/TodoPage.tsx` — Add analytics widget + update fetchTodos
13. `src/pages/SharedTodoPage.tsx` — Create new
14. `src/App.tsx` — Add route /shared/:id

---

#### Step 14 — Test Integrated Frontend + Backend

```bash
# Terminal 1 — run backend
cd backend
npm run dev

# Terminal 2 — run frontend
frontend cd
npm run dev

# Open browser: http:// localhost:5173
# Test flow:
# 1. Open → should be redirect to /signin
# 2. Click "Sign Up" → register a new account
# 3. Login with the newly created account
# 4. Must redirect to / → show todo page (empty)
# 5. Add some todos
# 6. Check AnalyticsWidget appears with statistics
# 7. Drag-and-drop reorder todos
# 8. Click share icon in todo → check clipboard (open in new tab)
# 9. Idle 5 minutes → should be auto-logout
# 10. Burger menu → Sign Out → redirect to /signin
```

---

#### Step 15 — Add Shared Todo Endpoint (Backend)

Add a public endpoint for SharedTodoPage:

```typescript
// In src/routes/todo.routes.ts, BEFORE router.use(authenticate):
// (this endpoint does not require auth — it can be accessed by anyone)

router.get('/shared/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
'SELECT id, text, completed, created_at FROM todos WHERE id = $1',
[en]
    );
    if (result.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Todo not found');
    }
    res.json({ todo: result.rows[0] });
  } catch (error) {
    next(error);
  }
});
```

---


```bash
# Edit the backend/.env file

# Restart backend:
# Ctrl+C → npm run dev

# No code needs to be changed!
# Only the DATABASE_URL is different.
```

---


|-------|-----------------|----------|
| `DATABASE_URL` | `postgresql:// postgres:pass@localhost:5432/todoapp` | `postgresql://postgres:pass@db.xxx.:5432/postgres` |
| SSL in `db.ts` | `ssl:false` | `ssl: { rejectUnauthorized: false }` |
| Access via DBeaver | Host: localhost | Host: db.xxx. + SSL: require |
| Suitable for | Development on your own machine | Staging / Production / access from anywhere |
| Price | Free (local) | Free tier: 500MB storage, 2 projects |
| Backend code | **IDENTICAL** | **IDENTICAL** |

**More robust SSL configuration in `src/config/db.ts`:**

```typescript
export const pool = new Pool({
connectionString: env.DATABASE_URL,
  // Auto-detect: if URL contains '' or production → enable SSL
  ssl: env.DATABASE_URL.includes('') | env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
: false,
max: 10,
idleTimeoutMillis: 30000,
});
```

---

## 17. What to Build After MVP

Priority development list after basic version is running:

1. **Rate limiting** — Install `express-rate-limit`; limit endpoint login to a maximum of 5x/minute per IP to prevent brute force attacks on passwords.

2. **Refresh token** — Current JWT expires after 7 days and the user must log in again. Implement refresh tokens (long-term tokens to get new access tokens) for a smoother experience.

3. **Input sanitization** — Install `express-validator`; sanitizing all input to prevent XSS (Cross-Site Scripting) if todo text is ever rendered as HTML.

4. **Email verification** — After signing up, send a verification email. Users must verify their email before they can log in. Install `nodemailer` to send emails.

5. **Password reset** — Flow forgot password via email with a reset link that expires in 15 minutes.

6. **Todo categories / tags** — Add `categories` table, many-to-many relationship with todos. Filter todos by category. Update analytics for breakdown per category.

7. **Pagination for todos** — If user has hundreds of todos, implement `LIMIT` and `OFFSET` in backend query + infinite scroll in frontend.

8. **Real-time sync** — Use WebSoctot (Soctot.io) or Server-Sent Events to sync real-time todos if the user opens them on two different tabs/devices.

9. **Export todos** — Endpoint GET /api/todos/export that returns CSV or JSON from all user todos.

10. **Docker** — Containerize backend + PostgreSQL with Docker Compose for easy local setup on any machine (no need to install PostgreSQL manually).

---

*End of Document — Todo List App v2.0 Implementation Plan*
