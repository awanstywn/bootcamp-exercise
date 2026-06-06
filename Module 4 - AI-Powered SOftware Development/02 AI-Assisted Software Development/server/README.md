# Antigravity API Server

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/tech-Node.js%20|%20Express%20|%20Prisma-blue.svg)

## Elevator Pitch
The Antigravity Server is a robust Node.js/Express REST API that powers the Product Management Dashboard. It abstracts complex database interactions via Prisma, handles secure JWT-based user authentication, and provides reliable data persistence for products and categories.

## Visuals Placeholder
![App Screenshot](../docs/server-architecture.png)

## Tech Stack
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT) & bcrypt
- Zod (via shared workspace)

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or pnpm

## Installation & Local Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables by creating a `.env` file based on `.env.example`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   JWT_SECRET="your_secret"
   JWT_EXPIRES_IN="7d"
   ```
4. Push the database schema and optionally seed data:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

## Usage
To start the backend server in development mode (with hot-reloading via nodemon):
```bash
npm run dev
```
The API will run on `http://localhost:3000`.

## Monorepo Architecture
The `server` layer functions as the data access and business logic tier of the monorepo. It validates incoming client requests using schemas from the `shared` workspace, processes them using a Controller-Service pattern, and persists state via Prisma.

## License
MIT License
