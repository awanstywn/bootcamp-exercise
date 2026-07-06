# AI Agent Instructions - Global Rules

These instructions are CRITICAL and must be followed by all AI agents working on this monorepo.

## Project Structure & Dependencies

- **NPM Workspaces Monorepo:** This project strictly uses `npm workspaces`.
- **Dependency Management (CRITICAL):** NEVER run `npm install` inside the `client/` or `server/` directories. All `npm install` commands MUST be executed at the root of the project (e.g., `npm install packageName -w client`).

## Architectural Boundaries

- **The Shared Layer:** `shared/src/types.ts` acts as the strict API contract between the frontend and backend.
- **Type Syncing:** If a database Enum (e.g., `Role`) or Schema changes in `server/prisma/schema.prisma`, you MUST manually duplicate/update the corresponding DTO or Enum in `shared/src/types.ts`.
- **Database Isolation:** NEVER import `@prisma/client` or backend database models into the `client/` folder. This will instantly crash the frontend bundler.

## General Coding Standards

- **Strict TypeScript:** The use of `any` is strictly forbidden.
- **Consistent Enums:** When utilizing enums (like `Role`), prefer importing and using the explicit enum (e.g., `Role.ADMIN`) rather than hardcoded string literals to preserve type safety.
- **Security:** Never commit tokens or secrets. Use explicit allowlists to filter sensitive data from database queries before returning to the frontend.
- **Error Handling:** Throw custom errors on the backend and catch them gracefully on the frontend.
- **Aesthetics (Client):** Prioritize rich aesthetics, modern typography, and interactive micro-animations. Ensure all UI components follow best practices.

_Note: For specific rules regarding individual layers, see the `AGENTS.md` file located within that layer._
