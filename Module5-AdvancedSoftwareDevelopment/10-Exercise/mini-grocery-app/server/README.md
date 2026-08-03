# Mini Grocery (Sembako) App - Backend API

A backend-only e-commerce API built for a grocery store. This API supports two roles: Visitor (Buyer) and Admin (Store Owner), featuring custom user shopping carts, local payment receipt uploads, and an advanced Order State Machine.

Built with **Express API** + **TypeScript** + **Prisma** + **PostgreSQL** (Supabase) + **Docker**.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Express 5, TypeScript |
| Database | PostgreSQL (via Prisma) |
| ORM | Prisma |
| Validation | Zod |
| File Upload | Multer (Local Disk Storage) |
| Logging | Winston |
| Auth | JWT (jsonwebtoken) + bcrypt |
| DevOps | Docker, Docker Compose |
| Code Quality | ESLint (flat config), Prettier |

## Features
- **Visitor (Buyer):** Browse products by category, manage a persisted cart, seamless checkout process, upload payment proofs via local storage, and track order status history.
- **Admin (Store Owner):** Fully manage products and categories (CRUD) with images, track store metrics (Total Revenue, Total Orders) via the Finance Dashboard, and manage the complete order lifecycle (Verification, Processing, Shipping, Delivery, or Rejection with restocking).
- **Architecture:** 
  - Standardized JSON responses (`{ success, message, data? }`).
  - Strict Zod validation on all endpoints.
  - JWT Auth with role-based access control (RBAC).
  - Prisma transactions for inventory concurrency protection.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (local or Supabase)
- Docker (optional)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your database URL, JWT secrets, and port
```

### 3. Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database and seed initial data
npx prisma db push --accept-data-loss
npm run prisma:seed
```

### 4. Start Development
```bash
npm run dev
```
- Backend API running on `http://localhost:3000`

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start server in development mode (tsx watch) |
| `npm run build` | Compile TypeScript into JavaScript |
| `npm run start` | Start production server |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:seed` | Seed the database with admin and products |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run docker:up` | Start the backend using Docker Compose |
| `npm run docker:down`| Stop Docker Compose |

## Docker

You can run the entire backend using Docker. This will build the API and expose it on port 3000.

```bash
# Build and start the backend service
npm run docker:up

# View logs
npm run docker:logs

# Stop service
npm run docker:down
```

## Project Structure

```
├── server/               # Express API backend workspace
│   ├── prisma/           # Schema, migrations, and seeds
│   ├── uploads/          # Local storage for uploaded images
│   └── src/
│       ├── config/       # App configuration (env, logger, cors)
│       ├── controllers/  # Route handlers
│       ├── db/           # Prisma client singleton
│       ├── middleware/   # Express middleware (auth, RBAC, error, upload, rate limit)
│       ├── routes/       # API route definitions
│       ├── services/     # Business logic layer
│       ├── types/        # TypeScript types and Express overrides
│       ├── utils/        # Helpers (errors, asyncHandler)
│       └── validators/   # Zod validation schemas
│
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```


## 🔐 Demo Credentials
For testing the application, you can use the following demo accounts:
- **Admin:** `admin@sembako.com` | Password: `Admin123!` | Role: `ADMIN`
- **Buyer:** `buyer@sembako.com` | Password: `Buyer123!` | Role: `VISITOR`
