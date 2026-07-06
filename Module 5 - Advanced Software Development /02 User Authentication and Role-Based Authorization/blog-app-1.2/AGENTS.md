# AI Agent Instructions

These instructions are CRITICAL and must be followed by all AI agents working on this monorepo.

## Project Structure & Setup
- **Monorepo:** This is an NPM Workspaces monorepo. 
- **CRITICAL:** NEVER run `npm install` inside the `client/` or `server/` directories. All `npm install` commands MUST be executed at the root of the project.
- `client/`: React 19 + Vite frontend (SSR enabled).
- `server/`: Express 5 + Node.js backend.
- `shared/`: Shared TypeScript types defining the strict API contracts.

## Tech Stack Rules
- **Database (Server):** Always use `Prisma`. Do not write raw SQL unless absolutely necessary.
- **Validation:** Use manual validation for inputs where necessary. Ensure types align with shared contracts.
- **State Management (Client):** Always use `Zustand`. Do not introduce Redux or Context API for global state.
- **Styling (Client):** Always use `Tailwind CSS`. Do not write custom CSS or introduce CSS modules.

## Architectural Guidelines (The DTO Pattern)
- **Database vs. Client Types:** NEVER import `@prisma/client` or backend database models into the `client/` folder. This will crash the frontend bundler.
- **Shared Types:** If a database Enum (e.g. `Role`) or Schema changes in `server/prisma/schema.prisma`, you MUST manually duplicate/update the corresponding DTO or Enum in `shared/src/types.ts`. The `shared/` folder acts as the strict API contract between the frontend and backend.
- **Consistent Enum Usage:** When utilizing enums (like `Role`), prefer importing and using the explicit enum (e.g. `Role.ADMIN`) rather than hardcoded string literals to preserve type safety across the stack.

## General Coding Standards
- Use strict TypeScript types. The use of `any` is strictly forbidden.
- Security First: Never commit tokens or secrets. Use explicit allowlists to filter sensitive data from database queries before returning to the frontend (e.g. stripping `passwordHash`). Implement rate limits on sensitive endpoints.
- Error Handling: Throw custom errors on the backend and catch them gracefully on the frontend. Use centralized error middleware.
