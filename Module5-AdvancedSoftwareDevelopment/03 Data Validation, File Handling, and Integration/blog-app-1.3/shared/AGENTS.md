# Shared Library AI Agent Instructions

These instructions are CRITICAL when working on the `shared/` layer.

## Architecture

- **Core:** Pure TypeScript.
- **Purpose:** To serve as the single source of truth for API contracts (DTOs) and Enums across the entire monorepo.

## Guidelines

- **Strict DTOs:** This folder is for Data Transfer Objects (DTOs) only. Do not put business logic, helper functions, or framework-specific code here.
- **No External Dependencies:** This package must remain 100% pure TypeScript. NEVER import `@prisma/client`, `React`, `Express`, or any other heavy backend/frontend libraries into this folder. If you do, it will crash the frontend bundlers.
- **Readonly Types:** All DTO interfaces should use `readonly` properties to enforce immutability across network boundaries.
- **Synchronization:** If you are instructed to modify a database schema in `server/prisma/schema.prisma`, you MUST come to this folder and update the corresponding DTO or Enum to keep the API contract perfectly synchronized. For example, if Prisma's `Role` enum is updated, it must be updated in `shared/src/types.ts` as well.
- **NPM Workspaces:** Do not run `npm install` inside this folder. Use the root directory.
