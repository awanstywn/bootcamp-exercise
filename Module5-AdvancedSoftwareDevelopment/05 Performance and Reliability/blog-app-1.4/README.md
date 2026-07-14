# Fullstack Blog Application

Welcome to the Fullstack Blog Application! This is a modern, responsive, and robust blog platform built using a modern JavaScript/TypeScript stack.

## Architecture

This project is a monorepo containing a full-stack application divided into a `client` and a `server`, as well as a `shared` directory for common types.

### Client (Frontend)

- **Framework:** React 19 with Vite.
- **Styling:** Tailwind CSS 4 for rapid and responsive UI development.
- **Routing:** React Router v7.
- **State Management:** Zustand 5 (e.g., `authStore`) for simple and effective global state.
- **Data Fetching:** Axios for communicating with the backend API.
- **Features:** Server-Side Rendering (SSR) capabilities, PWA features (Workbox), and SEO optimizations via React Helmet Async.

### Server (Backend)

- **Framework:** Express.js 5 running on Node.js.
- **Language:** TypeScript.
- **Database ORM:** Prisma 7 interacting with a PostgreSQL database.
- **Caching & Real-Time:** Redis (via `ioredis`) for high-performance data caching and (future) BullMQ task queues.
- **Authentication:** JWT-based authentication with bcrypt for password hashing. Features include refresh token rotation, token reuse detection, and single-use password reset tokens.
- **Security & Reliability:** Rate limiting (`express-rate-limit`), robust input validation (`zod`), centralized Winston logging, and graceful shutdowns.
- **File Uploads:** Multer for handling multipart/form-data.

## Directory Structure

```text
blog-app/
├── client/         # React frontend application
├── server/         # Express backend API
├── shared/         # Shared TypeScript types/interfaces
├── README.md       # This file
└── AGENTS.md       # Root agent instructions for AI assistants
```

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn
- Database (PostgreSQL or as configured in Prisma schema)

### Installation

1. **Clone the repository**
2. **Install dependencies:**
   Because this is an NPM Workspaces monorepo, you only need to run the install command once at the root level. Do **not** run `npm install` inside the client or server folders!

   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` in both the `client` and `server` directories.
   * **CRITICAL:** Ensure you add your PostgreSQL `DATABASE_URL` to the server's `.env` before proceeding to the next step.

4. **Database Setup (Server):**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed # Optional: Seed initial data
   ```

### Running the Application

**Docker Production Build (Recommended):**

The application is containerized and managed using Docker Compose. This will orchestrate both the PostgreSQL database and the fullstack application in a single command.

```bash
docker-compose up -d --build
```

- The React frontend will be available at `http://localhost:8000`
- The Express backend API will be available at `http://localhost:3000`
- To stop the application, run: `docker-compose down`

**Development Mode:**

You can boot up both the React frontend and the Express backend simultaneously from the root folder without Docker:

```bash
npm run dev
```

**Local Production Build:**

Build both the client and server at the same time from the root without Docker:
```bash
npm run build
```

## Objective & Risks

The main objective of this application is to provide a seamless reading and writing experience for a blog, complete with authentication, rich text/content handling, and user engagement features.
**Risks:** Handle user data with care. Ensure that environment variables (like JWT secrets) are kept secure and never exposed to the client. Keep Prisma schemas synced with your database.
