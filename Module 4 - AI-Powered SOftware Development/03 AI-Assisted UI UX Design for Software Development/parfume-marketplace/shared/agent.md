# Shared Agent Guidelines

## 1. Package Overview
This `shared` workspace contains code that acts as the contract between the frontend (`client`) and the backend (`server`). It ensures end-to-end type safety and consistent validation across the entire stack.

## 2. Tech Stack
- TypeScript
- Zod (Schema Validation)

## 3. Directory Structure
- `/src/schemas`: Contains Zod validation schemas used by the server to validate incoming requests and by the client to structure forms/payloads.
- `/src/types`: Exported TypeScript interfaces and types inferred from Zod schemas or custom defined.

## 4. Modifying Shared Code
- When adding a new feature that requires data exchange between client and server, always start by defining the schema in this package.
- Ensure that any updates to a schema do not break existing implementations in the client or server.
- Whenever this package is modified, TypeScript must recompile it or the IDE must be aware of the updates (usually automatic through path aliases or workspace links).

## 5. Documentation Standard
- Provide JSDoc style comments at the top of each file explaining its objective, relations to other elements, and how it works to aid mentorship and team collaboration.
- Document any strict validation rules (e.g., minimum length, regex constraints) within the Zod schemas using clear English descriptions.
