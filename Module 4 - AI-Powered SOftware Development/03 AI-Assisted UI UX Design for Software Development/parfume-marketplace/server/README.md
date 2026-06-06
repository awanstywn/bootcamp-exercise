# Parfume Marketplace - Server (Backend)

This is the backend workspace for the Parfume Marketplace application. It serves as a robust and scalable REST API using modern Node.js standards.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: Multer

## 📁 Directory Structure
- `/src/controllers`: Request handlers that format responses and pass data to services.
- `/src/services`: The core business logic, including database transactions via Prisma.
- `/src/routes`: Express Router definitions linking HTTP methods/URLs to controllers.
- `/src/middlewares`: Custom middleware for authentication, authorization, error handling, and request validation.
- `/src/lib`: Utilities such as the configured Prisma client and file upload helpers.
- `/prisma`: Prisma schema definitions and database migrations/seeds.

## 🚀 Development Setup

1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your PostgreSQL credentials, JWT secret, and port.
   ```bash
   cp .env.example .env
   ```

2. **Database Setup**:
   Ensure PostgreSQL is running, then sync the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Alternatively, from the project root: `npm run dev:server`.

## 📖 Code Documentation Standards
The codebase adheres to rigorous documentation standards. Every file starts with a JSDoc block explaining:
- **Objective/Function**: What the file does.
- **Relationships**: How it connects to other modules (e.g., how a controller uses a service).
- **How it Works**: A plain-English explanation of the internal logic to aid mentors and collaborators.
