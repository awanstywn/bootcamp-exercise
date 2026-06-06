# Server Agent Guidelines

## 1. Tech Stack
- Express.js
- Node.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT) for Authentication
- Multer for File Uploads

## 2. Directory Structure
- `/src/controllers`: Handlers for API endpoints. Extracts data from requests and formats responses.
- `/src/services`: Core business logic and database interactions via Prisma.
- `/src/routes`: API route definitions bridging URLs to controllers.
- `/src/middlewares`: Express middlewares for validation, error handling, and authentication.
- `/src/lib`: Utility functions and shared helpers (e.g., Prisma client instantiation).

## 3. Database Rules
- Schema definitions belong in `/prisma/schema.prisma`.
- Whenever modifying the schema, always run `npx prisma format` followed by `npx prisma db push` (or `migrate dev`) and `npx prisma generate`.
- Do not perform complex business logic inside controllers; delegate to services.

## 4. API Design Guidelines
- Follow RESTful principles.
- Use standard HTTP status codes (200 for OK, 201 for Created, 400 for Bad Request, 401/403 for Auth Errors, 404 for Not Found, 500 for Internal Server Error).
- All response structures must be predictable (e.g., `{ success: true, data: { ... } }` or `{ success: false, message: "Error" }`).
- Input validation should be performed at the middleware level using Zod schemas from the `shared` workspace.

## 5. Documentation Standard
- Provide JSDoc style comments at the top of each file explaining its objective, relations to other elements, and how it works to aid mentorship and team collaboration.
