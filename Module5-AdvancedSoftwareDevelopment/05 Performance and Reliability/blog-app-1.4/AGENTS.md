# AI Agent Instructions

These instructions are CRITICAL and must be followed by all AI agents working on this monorepo.

## Project Structure & Setup
- **Monorepo:** This is an NPM Workspaces monorepo. 
- **Dockerized:** The application is containerized and orchestrated via Docker Compose (`docker-compose.yml`), managing both the Node application and a permanent PostgreSQL database volume.
- **CRITICAL:** NEVER run `npm install` inside the `client/` or `server/` directories. All `npm install` commands MUST be executed at the root of the project.
- `client/`: React 19 + Vite frontend (SSR enabled).
- `server/`: Express 5 + Node.js backend.
- `shared/`: Shared TypeScript types defining the strict API contracts.

## Tech Stack Rules
- **Database (Server):** Always use `Prisma`. Do not write raw SQL unless absolutely necessary.
- **Caching (Server):** Use `ioredis` connected to the Redis container. Implement caching at the **Service layer** (not Route/Controller) to allow programmatic invalidation on mutations. Default TTL is defined by `CACHE_TTL`.
- **Validation (Server & Client):** Always use `Zod` for runtime validation. Ensure validation schemas correctly match the expected middleware inputs (e.g. no nested `body` wrappers if the middleware parses `req.body` directly).
- **State Management (Client):** Always use `Zustand`. Do not introduce Redux or Context API for global state.
- **Styling (Client):** Always use `Tailwind CSS`. Do not write custom CSS or introduce CSS modules.

## Architectural Guidelines (The DTO Pattern)
- **Database vs. Client Types:** NEVER import `@prisma/client` or backend database models into the `client/` folder. This will crash the frontend bundler.
- **Shared Types:** If a database Enum (e.g. `Role`) or Schema changes in `server/prisma/schema.prisma`, you MUST manually duplicate/update the corresponding DTO or Enum in `shared/src/types.ts`. The `shared/` folder acts as the strict API contract between the frontend and backend.
- **Consistent Enum Usage:** When utilizing enums (like `Role`), prefer importing and using the explicit enum (e.g. `Role.ADMIN`) rather than hardcoded string literals to preserve type safety across the stack.

## General Coding Standards
- Use strict TypeScript types. The use of `any` is strictly forbidden.
- Security First: Never commit tokens or secrets. Use explicit allowlists to filter sensitive data from database queries before returning to the frontend (e.g. stripping `passwordHash`). Implement rate limits on sensitive endpoints.
- Error Handling: Throw custom errors (from `server/src/utils/errors.ts`) on the backend and catch them gracefully on the frontend. Controllers MUST be wrapped in `asyncHandler` with zero `try/catch` boilerplate.
- Logging: Use the custom Winston logger (`logger.info`, `logger.error`) instead of `console.log`. Always include context (e.g., `requestId`) when logging errors.
