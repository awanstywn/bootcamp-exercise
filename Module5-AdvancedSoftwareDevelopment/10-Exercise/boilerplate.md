# Fullstack Monorepo Boilerplate — Implementation Plan

## Overview

A reusable, production-ready fullstack boilerplate based on the `blog-app-1.5` file structure.

## Tech Stack

| Layer | Technology |
|---|---|
| Architecture | Monorepo (npm workspaces) |
| Frontend | React 19 + Vite 8 SSR + TailwindCSS v4 + Zustand + React Router |
| Backend | Express 5 + TypeScript + Prisma (pg adapter) + Zod |
| Database | PostgreSQL |
| Caching | Redis (ioredis) |
| Queue | BullMQ |
| File Upload | Cloudinary + Multer |
| Email | Nodemailer |
| Logging | Winston |
| Auth | JWT + bcrypt |
| DevOps | Docker + Docker Compose |
| Code Quality | ESLint (flat config) + Prettier |

## Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Blog-specific packages | ❌ Excluded: `react-markdown`, `rehype-sanitize`, `@tailwindcss/typography` |
| 2 | Socket.IO | ❌ Excluded (both server and client) |
| 3 | PWA Plugin | ❌ Excluded: `vite-plugin-pwa` |
| 4 | App name | `apps` |
| 5 | PostgreSQL port | Standard `5432:5432` (with TODO comments to customize) |
| 6 | Prisma schema | Empty — generator + datasource only, models added per-project |
| 7 | BullMQ | Generic queue infrastructure only, no business logic workers |

## File Structure

```
mini-grocery-app/
├── .dockerignore
├── .eslintignore
├── .gitignore
├── .prettierrc
├── Dockerfile
├── docker-compose.yml
├── eslint.config.mjs
├── package.json
├── README.md
│
├── client/
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── server.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── public/favicon.svg
│   └── src/
│       ├── App.tsx
│       ├── entry-client.tsx
│       ├── entry-server.tsx
│       ├── index.css
│       ├── components/.gitkeep
│       ├── hooks/.gitkeep
│       ├── lib/axios.ts
│       ├── pages/HomePage.tsx
│       └── store/.gitkeep
│
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   ├── prisma/schema.prisma
│   ├── scripts/.gitkeep
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── cors.ts
│       │   ├── env.ts
│       │   ├── logger.ts
│       │   ├── queue.ts
│       │   └── redis.ts
│       ├── controllers/.gitkeep
│       ├── db/prisma.ts
│       ├── middleware/
│       │   ├── error.middleware.ts
│       │   ├── performance.middleware.ts
│       │   ├── rateLimiter.middleware.ts
│       │   ├── requestId.middleware.ts
│       │   └── validate.middleware.ts
│       ├── routes/index.ts
│       ├── services/
│       │   ├── cache.service.ts
│       │   ├── email.service.ts
│       │   └── upload.service.ts
│       ├── types/express.d.ts
│       ├── utils/
│       │   ├── asyncHandler.ts
│       │   └── errors.ts
│       └── validators/.gitkeep
│
└── shared/
    ├── package.json
    └── src/types.ts
```

## Boilerplate Features (Pre-wired)

- ✅ **Data Validation** — Zod schemas + validate middleware
- ✅ **File Upload** — Cloudinary + Multer (memory storage, 5MB limit, image filter)
- ✅ **Email Integration** — Nodemailer with generic `sendEmail()` method
- ✅ **Caching** — Redis with fail-open CacheService abstraction
- ✅ **Error Handling** — AppError hierarchy + global error middleware (normalizes Zod/Prisma errors)
- ✅ **Logging** — Winston (file + console transports, JSON in production, colorized in dev)
- ✅ **Request Tracing** — UUID per request via `X-Request-Id` header
- ✅ **Performance Monitoring** — Request duration logging middleware
- ✅ **Rate Limiting** — Redis-backed global + auth rate limiters
- ✅ **SSR** — Vite SSR with `react-helmet-async` for SEO head management
- ✅ **Docker** — Multi-stage Dockerfile + docker-compose with PostgreSQL + Redis
