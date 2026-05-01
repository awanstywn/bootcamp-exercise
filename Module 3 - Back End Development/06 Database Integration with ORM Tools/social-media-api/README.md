# Social Media API

A robust RESTful backend service built for a modern social media or blogging platform. It features secure user authentication, robust data validation, and a strict layered architecture pattern.

## 🚀 Tech Stack
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma v7 (with `@prisma/adapter-pg`)
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **Validation:** Zod

## 📂 Architecture
The project strictly follows a **Layered Architecture** to enforce separation of concerns:
1. **Routes (`/routes`)**: Maps HTTP methods and endpoints to their respective controllers. Also applies middleware (Auth, Zod Validation).
2. **Controllers (`/controllers`)**: Handles HTTP requests, extracts parameters/body data, and passes them to the Service layer. Controllers do not contain business logic.
3. **Services (`/services`)**: Contains the core business logic, database queries (Prisma), and throws specific error instances if business rules fail.

## ⚙️ Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL database (Local or Cloud like Neon/Supabase)

## 🛠 Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/social_media_db"
   JWT_SECRET="your_super_secret_key_minimum_32_characters"
   JWT_EXPIRES_IN="7d"
   PORT="3000"
   NODE_ENV="development"
   CORS_ORIGIN="*"
   ```

3. **Database Migration & Prisma Client**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The server uses `tsx` for blazing-fast TypeScript execution in watch mode.*

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive a JWT

### Users
- `GET /api/users` — Retrieve a list of all users
- `GET /api/users/:id` — Retrieve a specific user's profile
- `PUT /api/users/:id` — Update profile (requires Auth + Ownership)
- `GET /api/users/:id/posts` — Get all posts created by a user

### Posts
- `GET /api/posts` — Retrieve all posts (with author details)
- `GET /api/posts/:id` — Retrieve a specific post (with comments & likes)
- `POST /api/posts` — Create a new post (requires Auth)
- `PUT /api/posts/:id` — Update a post (requires Auth + Ownership)

## 🔐 Security Best Practices Implemented
- **Password Hashing:** Passwords are never stored in plain text. `bcrypt` is used with 10 salt rounds.
- **Data Protection:** Database queries explicitly use `select` to omit password hashes from API responses.
- **Resource Ownership:** Services explicitly verify if the `req.user.userId` matches the resource's `authorId` before allowing updates.
- **Error Obfuscation:** The login endpoint returns generic "Invalid credentials" messages to prevent email enumeration attacks.
