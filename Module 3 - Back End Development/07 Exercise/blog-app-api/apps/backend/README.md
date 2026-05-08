# Blog App — Backend API

Express.js REST API for the Blog App. Handles authentication, user management, and article CRUD operations.

## 🚀 Tech Stack
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma v7 (with `@prisma/adapter-pg`)
- **Auth:** JWT + bcrypt
- **Validation:** Zod

## 📂 Architecture (Layered)
```
src/
├── server.ts               ← Entry point — starts HTTP server
├── app.ts                  ← Express app setup — middleware + route mounting
├── config/prisma.ts        ← Prisma client singleton
├── routes/                 ← Route definitions + Zod schemas
│   ├── auth.routes.ts
│   ├── article.routes.ts
│   └── user.routes.ts
├── controllers/            ← Request handlers (thin, no business logic)
│   ├── auth.controller.ts
│   ├── article.controller.ts
│   └── user.controller.ts
├── services/               ← Business logic + Prisma queries
│   ├── auth.service.ts
│   ├── article.service.ts
│   └── user.service.ts
├── middleware/
│   ├── auth.middleware.ts       ← JWT verification
│   ├── validate.middleware.ts   ← Zod body validation
│   └── error.middleware.ts      ← Global error handler + AppError class
└── types/
    └── express.d.ts             ← Augments Express Request with `user` field
```

## ⚙️ Commands
```bash
# From monorepo root:
npm run dev:backend          # Start dev server (tsx watch mode)

# From this directory:
npm run dev                  # Start dev server
npm run build                # Compile TypeScript
npm run start                # Run compiled JS (production)
```

## 🔧 Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Signing key for tokens (min 32 chars)
- `JWT_EXPIRES_IN` — Token expiry (default: `7d`)
- `PORT` — Server port (default: `3000`)
- `CORS_ORIGIN` — Allowed frontend origin (default: `http://localhost:5173`)
