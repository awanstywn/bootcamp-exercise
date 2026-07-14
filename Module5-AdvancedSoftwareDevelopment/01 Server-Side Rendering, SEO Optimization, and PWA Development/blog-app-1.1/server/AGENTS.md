# AI Agent Instructions - Server Layer

## Context

You are operating within the `server/` directory, which is the Node.js + Express backend of the blog application.

## Specific Rules

- **Database Usage:** Always use `Prisma`. Do not write raw SQL unless absolutely necessary (e.g., complex full-text search indexing that Prisma cannot handle).
- **Separation of Concerns:** Keep controllers thin. Controllers should only handle req/res formatting and input validation. Move complex database queries and business logic into the `services/` directory.
- **Type Syncing (CRITICAL):** If you modify a database Enum (e.g., `Role`) or a Model Schema in `server/prisma/schema.prisma`, you MUST manually duplicate/update the corresponding DTO or Enum in `shared/src/types.ts`. The `shared/` folder acts as the strict API contract between the frontend and backend.
- **Error Handling:** Use custom application errors (`BadRequestError`, `NotFoundError`) and let the centralized `error.middleware.ts` handle sending the response to the client.

## Global Rules

For project-wide rules (such as dependency installation rules and DTO patterns), please refer to the root `AGENTS.md`.
