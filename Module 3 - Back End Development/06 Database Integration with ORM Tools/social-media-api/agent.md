# AI Agent Context: Social Media API

Welcome, AI Agent! You are assisting the USER with the **Social Media API** project. This file provides you with the critical context needed to understand the codebase, adhere to established architectural patterns, and maintain code quality without breaking existing implementations.

## 🎯 Project Overview
This is a modern Express.js REST API built with TypeScript, Prisma ORM, and PostgreSQL. It is structured to be robust, maintainable, and production-ready.

### Upcoming Objective (The Next Exercise)
The API is currently transitioning from a generic "Social Media API" into a specific **"Blog App API"**. 
Future tasks will likely involve:
- Renaming the `Post` model to `Article` in the Prisma schema.
- Adding a `Delete` feature for articles.
- Enhancing articles with new fields like `title` and `published`.

## 🏗 Architectural Rules (STRICT)

Whenever you add new features or modify existing ones, you MUST follow this **Layered Architecture**:

1. **Routes (`src/routes`)**
   - **Responsibility:** Mounting endpoints, attaching middleware (JWT Auth, Zod Validation).
   - **Rule:** Never put logic here. Just route the request to the controller.

2. **Controllers (`src/controllers`)**
   - **Responsibility:** Extracting data (`req.body`, `req.params`, `req.user`) and sending the JSON response.
   - **Rule:** Controllers must be thin. **Absolutely NO database logic (Prisma) or business rules here.** Catch async errors and pass them to `next()`.

3. **Services (`src/services`)**
   - **Responsibility:** The heart of the application. All Prisma queries, business rules, and ownership checks live here.
   - **Rule:** Services must throw `AppError` instances (e.g., `throw new AppError('Forbidden', 403)`) if logic fails. They return raw data objects back to the controller.

4. **Middleware (`src/middleware`)**
   - **Error Handling:** `error.middleware.ts` catches all thrown `AppError`s and formats them into `{ error: string, details?: any }`.
   - **Validation:** `validate.middleware.ts` is a higher-order function that takes a Zod schema and validates the `req.body`.
   - **Authentication:** `auth.middleware.ts` decodes JWTs and injects `{ userId, email }` into `req.user`.

## 💾 Database & Prisma Guidelines
- **Prisma v7 Behavior:** The project currently uses Prisma v7 logic. Due to recent compatibility fixes, the `PrismaClient` initialization in `src/config/prisma.ts` explicitly uses the `@prisma/adapter-pg` driver. Do not remove this setup.
- **Passwords:** Never return password fields in Prisma queries. Always use `select` or explicitly omit them.
- **Ownership:** When updating or deleting a resource, always verify that `userId === resource.authorId` within the Service layer before mutating the database.

## 🔧 Code Quality Standards
- **TypeScript:** Use strict types. Avoid `any`. Let Prisma generate types for database models.
- **Comments:** The project places a high emphasis on comprehensive English comments. Explain *why* the code is doing something, especially for security checks and complex Prisma queries.
- **Naming Conventions:** Unused parameters in Express handlers should be prefixed with an underscore (e.g., `_req`, `_next`).

Always read this file before suggesting major architectural changes or when implementing the new Blog API requirements.
