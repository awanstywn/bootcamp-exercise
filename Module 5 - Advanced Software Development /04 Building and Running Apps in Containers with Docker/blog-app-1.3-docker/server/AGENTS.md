# Server-Side AI Agent Instructions

These instructions are CRITICAL when working on the `server/` layer.

## Architecture

- **Framework:** Express.js 5
- **Database:** Prisma ORM 7 with PostgreSQL
- **Dockerized:** Containerized into a single Docker image along with the frontend.

## Architectural Layers & Guidelines

- **Routes:** Keep routes completely thin. Only use them to link middlewares and controllers.
- **Validation (Strictly Zod):** ALWAYS use `Zod` for validation. Never use Joi or manual regex. Use the existing `middleware/validate.middleware.ts` to validate `req.body`, `req.query`, and `req.params` against Zod schemas before the request reaches the controller.
- **Controllers (HTTP Only):** Controllers MUST NOT contain business logic or database calls. A controller's ONLY job is to extract data from the `Request`, pass it to a Service, and format the `Response`.
- **Services (Business Logic):** ALL business logic, Prisma database calls, and data mapping MUST live in the Service layer. 
- **DTO Mapping:** Services are strictly responsible for mapping raw Prisma database objects into safe DTOs (from `shared/src/types.ts`) before returning them to the Controller. Never leak passwords or hidden database columns to the Controller. Use explicitly defined allowlists (picking specific fields) rather than exclusion lists.

## Database & Security

- **Database:** Do not use raw SQL unless necessary. Always rely on the Prisma Client (`db/prisma.ts`).
- **Error Handling:** Use the global error handling middleware (`middleware/error.middleware.ts`). Throw standard Node.js Errors or custom `AppError` inside services. Controllers should wrap service calls in try/catch and pass errors to `next(error)`.
- **Security:** Ensure `auth.middleware.ts` is applied to protected routes. Role-based checks (`rbac.middleware.ts`) should be used for admin features, and ALWAYS use the Prisma `Role` enum (e.g. `Role.ADMIN`) rather than raw string literals.
- **Rate Limiting:** Protect high-risk endpoints (email verification, password resets, auth endpoints, file uploads) with `express-rate-limit`.
- **Tokens:** Critical temporary tokens (like password resets) must embed single-use state validation (e.g. embedding the old password hash) to prevent replay attacks if a URL is intercepted.
