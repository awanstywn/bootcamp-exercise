# Blog App — Fullstack Monorepo

A modern fullstack blog application featuring a decoupled monorepo architecture with a shared type-safe contract between frontend and backend.

## 🏗 Architecture

```
blog-app-api/              ← Monorepo Root (npm workspaces)
├── apps/
│   ├── backend/            ← Express REST API
│   └── frontend/           ← React SPA
└── packages/
    └── shared/             ← Shared Zod schemas & TypeScript types
```

### Why Monorepo?
- **Single source of truth** — Zod schemas and TypeScript types are defined once in `packages/shared` and imported by both frontend and backend.
- **One repository** — Simplifies CI/CD, code reviews, and dependency management.
- **Type safety** — Changes to the API contract are immediately visible on both sides.

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Express.js · TypeScript · Prisma v7 · PostgreSQL · JWT · bcrypt · Zod |
| **Frontend** | React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · Zustand 5 · Axios · React Router 7 |
| **Shared** | Zod · TypeScript |

## ⚙️ Prerequisites
- Node.js v20+
- PostgreSQL database (local or cloud: Neon / Supabase)

## 🛠 Getting Started

### 1. Install all dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your database credentials
```

### 3. Run database migrations
```bash
cd apps/backend
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 4. Start development servers
```bash
# Start both backend (port 3000) and frontend (port 5173)
npm run dev

# Or start individually:
npm run dev:backend
npm run dev:frontend
```

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register a new account |
| POST | `/api/auth/login` | ❌ | Sign in, receive JWT |

### Articles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/articles` | ❌ | List all published articles |
| GET | `/api/articles/:id` | ❌ | Get article details |
| POST | `/api/articles` | ✅ | Create a new article |
| PUT | `/api/articles/:id` | ✅ | Update article (owner only) |
| DELETE | `/api/articles/:id` | ✅ | Delete article (owner only) |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | ❌ | List all users |
| GET | `/api/users/:id` | ❌ | Get user profile |
| PUT | `/api/users/:id` | ✅ | Update profile (owner only) |
| GET | `/api/users/:id/articles` | ❌ | Get user's articles |

## 📂 Frontend Pages
| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero section + public article grid |
| `/articles/:id` | Article Detail | Full article view with author info |
| `/profile/:id` | Profile | User profile + their published articles |
| `/dashboard` | Dashboard | CRUD interface for your own articles (protected) |

## 🔐 Security
- Passwords hashed with `bcrypt` (10 salt rounds)
- JWT-based authentication with configurable expiry
- Resource ownership verification in service layer
- Generic error messages to prevent email enumeration
- Zod validation on both frontend and backend
