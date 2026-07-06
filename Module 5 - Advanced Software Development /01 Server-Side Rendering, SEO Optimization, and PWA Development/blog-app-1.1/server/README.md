# Backend Server

This is the Express backend for the Fullstack Blog Application.

## Overview

The server layer is responsible for data persistence, authentication, and serving the API consumed by the frontend client. It connects to a PostgreSQL database using Prisma ORM.

## Architecture & Tech Stack

- **Framework:** Express 5 running on Node.js.
- **Language:** TypeScript.
- **Database ORM:** Prisma 7.
- **Database Engine:** PostgreSQL.
- **Security:** `express-rate-limit` for DDoS protection, `helmet` for HTTP headers, and strict Zod validation for environment variables.

## Directory Structure

- `src/controllers/`: Route handlers handling request/response formatting.
- `src/services/`: Core business logic and database interactions.
- `src/routes/`: Express router definitions.
- `src/config/`: Configuration files (environment variables, CORS).
- `src/middleware/`: Express middlewares (error handling, auth).

## Setup & Scripts

_Note: All installation commands must be run from the root directory (e.g. `npm install package -w server`)._

Available scripts within the server:

- `npm run dev:server`: Starts the development server using `tsx watch`.
- `npm run prisma:generate`: Generates the Prisma client.
- `npm run prisma:migrate`: Applies migrations to the PostgreSQL database.
- `npm run prisma:seed`: Runs the `seed_posts.ts` script to populate dummy data.

## Relationship to Monorepo

- **Dependencies:** The server depends on the `shared` layer for generating and aligning TypeScript definitions (DTOs, Enums).
- **Responsibilities:** When `schema.prisma` is updated, the server developer MUST also manually update the corresponding types in the `shared` workspace to ensure the client remains type-safe.
