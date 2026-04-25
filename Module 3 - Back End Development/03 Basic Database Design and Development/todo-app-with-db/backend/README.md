# 🗄️ Todo App — Backend

> Express.js + TypeScript + PostgreSQL backend for Todo List App v2.0

## Tech Stack

| Technology | Version | Function |
|-----------|-------|--------|
| Express.js | ^4.x | HTTP server + REST API |
| TypeScript | ^5.x | Type safety |
| pg (node-postgres) | ^8.x | PostgreSQL driver (raw SQL, no ORM) |
| jsonwebtoken | ^9.x | JWT auth token |
| bcryptjs | ^2.x | Password hashing |
| tsx | ^4.x | Fast TypeScript runner + watch mode |

## 📁 Structure

```
src/
├── config/
│   ├── env.ts                 ← Load + validate env vars from .env
│   └── db.ts                  ← pg.Pool connection
│
├── types/
│   └── index.ts               ← Centralized interfaces (User, Todo, ShareLink)
│
├── middleware/
│   ├── authenticate.ts        ← JWT verify → set req.userId
│   ├── validateBody.ts        ← Factory: check required fields in req.body
│   └── errorHandler.ts        ← Global error handler + AppError class
│
├── services/                   ← Business logic + raw SQL queries
│   ├── auth.service.ts        ← bcrypt hash, JWT sign, user CRUD
│   ├── todo.service.ts        ← Todo CRUD + search + transaction reorder
│   ├── share.service.ts       ← Generate/resolve short code (includes logic)
│   └── analytics.service.ts   ← 3 analytics queries (Aggregation)
│
├── routes/                     ← Express Router definitions + Handler logic
│   ├── auth.routes.ts         ← [Auth] POST /register, /login, /logout
│   ├── todo.routes.ts         ← [Todo] GET/POST/PUT/DELETE /todos + /shared/:id
│   ├── share.routes.ts        ← [Share] POST /api/share + GET /s/:code
│   └── analytics.routes.ts   ← [Analytics] GET /api/analytics
│
└── server.ts                  ← Entry point: Express setup + Listen on PORT
```

## 🚀 Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (tsx watch, port 4000)
npm run build      # Compile TypeScript to dist/
npm run typecheck  # Check TypeScript without compiling
```

## 📐 Architecture Patterns

### 1. Merged Handlers (Concise Routes)
To reduce complexity, route definitions and request handler logic are merged inside the `routes/` directory. This keeps the code concise without sacrificing readability.

### 2. Explicit Types
All database interactions within `services/` are strongly typed using explicit interfaces defined in `types/index.ts`. This ensures data integrity from the Database layer all the way to the API Response.

### 3. Service Layer (Raw SQL)
Business logic remains isolated within `services/`, utilizing parameterized queries (`$1, $2`) to prevent SQL Injection and avoid the overhead of an ORM.

### 4. Simplified Error Handling
The `AppError` class is centralized within `errorHandler.ts`, meaning error definitions and handling mechanisms are located in one logical place.

## 🔒 Security
- Passwords are securely hashed using `bcryptjs`.
- Endpoints are protected using JWT (7-day expiration).
- Ownership check: Every query inherently includes `user_id` to ensure users can only modify their own data.
