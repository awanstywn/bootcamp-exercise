# AI Agent Context: Blog App Monorepo

Welcome, AI Agent! This file provides critical context for working on the **Blog App** monorepo. Read this before suggesting changes.

## 🎯 Project Overview
A fullstack blog application using an **npm workspaces monorepo** with three packages:
- `apps/backend` — Express REST API (TypeScript, Prisma, PostgreSQL, JWT)
- `apps/frontend` — React SPA (TypeScript, Vite, Tailwind v4, Zustand, Axios)
- `packages/shared` — Shared Zod validation schemas and TypeScript type definitions

## 🏗 Architectural Rules

### Monorepo Structure
- **npm workspaces** manage all dependencies from the root `package.json`.
- The `@blog-app/shared` package exports Zod schemas and TypeScript types used by both apps.
- Frontend resolves `@blog-app/shared` as a workspace dependency and imports raw `.ts` source (no build step needed).

### Backend (`apps/backend`) — Layered Architecture
1. **Routes** → Mount endpoints, attach middleware (JWT, Zod validation). No logic.
2. **Controllers** → Extract `req.body`/`req.params`, call services, send `res.json()`. Thin layer.
3. **Services** → All Prisma queries, business rules, ownership checks. Throw `AppError` on failure.
4. **Middleware** → Error handler, JWT verifier, Zod validator.

### Frontend (`apps/frontend`) — Feature-Based Architecture
1. **API Layer (`src/api/`)** — Axios instances with interceptors (JWT injection, 401 auto-logout).
2. **Stores (`src/stores/`)** — Zustand stores for auth and article state management.
3. **Components** — Organized by concern: `layout/`, `ui/`, `article/`, `auth/`.
4. **Pages (`src/pages/`)** — Route-level components mapped in `App.tsx`.

## 💾 Database & Prisma Guidelines
- **Prisma v7** with `@prisma/adapter-pg` driver. Do not remove the adapter setup.
- Never return password fields in queries. Always use `select`.
- Ownership checks (`userId === resource.authorId`) must happen in the Service layer.

## 🎨 Frontend Design System
- **Theme**: Dark mode with glassmorphism, glow orb backgrounds, gradient accents.
- **Styling**: Tailwind CSS v4 (CSS-first config via `@import "tailwindcss"` + `@theme`).
- **Colors**: Violet primary (`#8b5cf6`), Pink secondary (`#ec4899`), Dark background (`#0a0a0e`).
- **Font**: Outfit (Google Fonts).
- **Animations**: Custom CSS keyframes (`fade-in`, `slide-up`, `float`).

## 🔧 Code Quality Standards
- **TypeScript strict mode** everywhere. Avoid `any` where possible.
- **Comments**: All files must have English header comments explaining the file's purpose and how the code works.
- **Naming**: Unused Express parameters prefixed with `_` (e.g., `_req`, `_next`).
- **Shared validation**: Zod schemas live in `packages/shared` — do not duplicate them in individual apps.
