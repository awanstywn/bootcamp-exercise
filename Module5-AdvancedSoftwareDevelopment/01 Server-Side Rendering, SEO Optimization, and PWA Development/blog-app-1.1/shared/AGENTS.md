# AI Agent Instructions - Shared Layer

## Context

You are operating within the `shared/` directory, which houses the pure TypeScript definitions forming the API contract between the frontend and backend.

## Specific Rules

- **Zero Executable Code:** This folder must NOT contain any logic, functions, or implementations. Only write `type`, `interface`, or `enum` definitions.
- **Zero Dependencies:** Do not add dependencies like `react`, `express`, or `@prisma/client` to this workspace's `package.json`.
- **The DTO Pattern:** This folder acts as the single source of truth for the shape of the data moving between the client and server. If a database schema in the `server/` directory changes, you must immediately update the definitions here to prevent the client from breaking.

## Global Rules

For project-wide rules (such as dependency installation rules and DTO patterns), please refer to the root `AGENTS.md`.
