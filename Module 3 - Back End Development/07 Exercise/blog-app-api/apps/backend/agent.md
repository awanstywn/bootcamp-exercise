# AI Agent Context: Backend API

## 🏗 Architectural Rules (STRICT)
1. **Routes** → Map endpoints + attach middleware. No logic.
2. **Controllers** → Extract data from `req`, call services, send `res.json()`. Must be thin.
3. **Services** → All Prisma queries, business rules, ownership checks. Throw `AppError` on failure.
4. **Middleware** → Error handler, JWT verifier, Zod validator (higher-order function pattern).

## 💾 Database
- Prisma v7 with `@prisma/adapter-pg` driver in `src/config/prisma.ts`.
- Never return password fields. Always use `select` to omit them.
- Ownership: verify `userId === resource.authorId` in Service layer before mutations.

## 📋 API Response Format
- **Success**: `{ message: string, [entity]: data }` (e.g., `{ message: "Article created", article: {...} }`)
- **Error**: `{ error: string }` — consistent shape from `error.middleware.ts`
- **Lists**: `{ articles: [...] }` or `{ users: [...] }` — plural key wrapping arrays

## 🔧 Standards
- All comments in English.
- Unused parameters: prefix with `_` (e.g., `_req`, `_next`).
- Zod schemas defined inline in route files (not yet migrated to `@blog-app/shared`).
