# Agent Instructions for Task Management Backend

## Project Overview
This project is a Task Management Backend built with:
- **Node.js & Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Supabase)

## Key Responsibilities
The project handles User Authentication (JWT) and Task CRUD operations with a focus on:
- Private task access control (Users can only access their own tasks).
- Soft deletion for tasks.
- Filtering, searching, and pagination.

## Directory Structure
- `src/middlewares`: Contains error handlers, JWT auth logic, and validation middlewares.
- `src/prisma`: Prisma client instantiation.
- `src/routes`: Express routing definitions.
- `src/services`: Business logic and database interactions.
- `src/utils`: Helper functions and utilities.
- `src/server.ts`: Entry point of the Express application.

## Coding Standards
1. **TypeScript First**: Ensure all parameters, responses, and interfaces are strictly typed.
2. **Service Pattern**: Business logic should strictly reside in `src/services/`. Routes should only handle request parsing and response formatting.
3. **Error Handling**: Use the custom `AppError` class for all expected errors (4xx, 5xx) to ensure consistent JSON error responses.
4. **Security**: Ensure all user-specific data mutations check the `userId` to prevent IDOR (Insecure Direct Object Reference).

## Common Tasks
- **Database Schema Changes**: When modifying `prisma/schema.prisma`, remember to run `npm run prisma:generate` and `npm run prisma:migrate`.
- **New Endpoints**: Add route in `src/routes/`, validation in `src/middlewares/`, and business logic in `src/services/`.

## Running the Application
- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
