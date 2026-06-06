# Marketplace for Parfume — MVP Implementation Plan

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Domain & Data Model](#4-domain--data-model)
5. [Backend Design (API, Auth, Data)](#5-backend-design-api-auth-data)
6. [Frontend Design (Pages & Components)](#6-frontend-design-pages--components)
7. [Visual Design System (Typography, Colors, UI Style)](#7-visual-design-system-typography-colors-ui-style)
8. [Page-by-Page UI/UX Specification](#8-page-by-page-uiux-specification)
9. [Auth & Application Workflow](#9-auth--application-workflow)
10. [Implementation Steps (Chronological)](#10-implementation-steps-chronological)
11. [Testing Strategy](#11-testing-strategy)
12. [Environment & Configuration](#12-environment--configuration)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Overview

### 1.1 Application Name

**Marketplace for Parfume**

### 1.2 High-Level Description

A web-based MVP perfume marketplace focused on the **customer-facing storefront** experience. The application allows users — both guests and registered members — to discover, browse, and explore a curated catalog of perfumes. Users can view detailed fragrance information (scent notes, concentration, brand) and add items to a client-side shopping cart.

> **Important distinction:** This plan is for a **customer-facing marketplace storefront**, NOT an internal product management dashboard or admin tool. There is no vendor dashboard, order management UI, or inventory admin panel in this MVP.

### 1.3 MVP Scope

The MVP delivers **4 primary pages**:

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | Home / Landing Page | `/` | Discover perfumes, see featured products, navigate by scent family |
| 2 | Category / Listing (Shop) Page | `/shop` | Browse, filter, and sort the full perfume catalog |
| 3 | Product Detail Page | `/products/:slug` | View detailed perfume information (notes, concentration, price) |
| 4 | Login / Register Page | `/auth` | Create an account, log in, or continue as a guest |

### 1.4 User Types

| User Type | Capabilities |
|-----------|-------------|
| **Guest User** | Browse Home, Shop, and Product Detail pages. Add items to cart (stored in browser local storage via Zustand). Prompted to log in for account features. |
| **Registered User** | All guest capabilities plus: authenticated session, personalized greeting, foundation for future features like persisted cart and order history. |

### 1.5 Non-Functional Requirements

- **Single-tenant**: One marketplace instance, one product catalog.
- **No multi-vendor dashboard**: Vendor management is a future enhancement.
- **Target environment**:
  - Development: `localhost` (backend on port 3000, frontend on port 5173).
  - Production: Deployable to any Node-compatible host (backend) and any static host (frontend) — not configured in MVP.
- **SEO & Performance**: Important but secondary to delivering the core browsing and auth flow.

---

## 2. Tech Stack

### 2.1 Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | ≥ 20 LTS |
| **Language** | TypeScript | ~5.4.5 (server) / ~6.0.2 (client) |
| **Backend Framework** | Express | ^4.19.2 |
| **ORM** | Prisma | ^7.8.0 |
| **Database** | PostgreSQL | ≥ 15 |
| **Auth** | bcrypt + jsonwebtoken | ^5.1.1 / ^9.0.2 |
| **Validation** | Zod | ^3.23.8 |
| **Frontend Framework** | React | ^19.2.6 |
| **Build Tool** | Vite | ^8.0.12 |
| **CSS Framework** | Tailwind CSS v4 | ^4.3.0 |
| **State Management** | Zustand | ^5.0.14 |
| **Routing** | React Router DOM | ^6.23.1 |
| **HTTP Client** | Axios | ^1.6.8 |
| **Icons** | Lucide React | ^0.378.0 |
| **Package Manager** | npm | ≥ 10 |
| **Monorepo** | npm workspaces | — |

### 2.2 Technology Rationale

| Technology | Why |
|-----------|-----|
| **Express** | Lightweight, mature HTTP framework for Node.js. Perfect for building a REST API with middleware (auth guards, validation, error handling). Huge ecosystem for e-commerce patterns. |
| **Prisma + PostgreSQL** | Prisma provides type-safe database access with auto-generated TypeScript types from the schema. PostgreSQL is a production-grade relational database ideal for structured e-commerce data (products, users, future orders). The `@prisma/adapter-pg` package enables direct `pg` driver usage for advanced connection pooling. |
| **bcrypt + jsonwebtoken** | Industry-standard password hashing (bcrypt with salt rounds) and stateless authentication (JWT). JWT allows the frontend to authenticate API requests without server-side sessions, simplifying the architecture. |
| **Zod** | Runtime schema validation that integrates seamlessly with TypeScript. Used on both server (request validation middleware) and client (form validation), with shared schemas in the `shared` package. |
| **React 19 + Vite 8** | React 19 offers the latest concurrent features and performance improvements. Vite 8 provides near-instant HMR and fast builds via native ESM, ideal for a responsive developer experience. |
| **Tailwind CSS v4** | Utility-first CSS framework for rapid, consistent UI development. v4 introduces CSS-first configuration (no `tailwind.config.js` required), uses the `@tailwindcss/vite` plugin for zero-config integration. Perfect for building a polished marketplace UI without writing custom CSS. |
| **Zustand** | Minimal, un-opinionated state management. Used for global auth state (current user, JWT token) and cart state (items, quantities). Much simpler than Redux for an MVP. |
| **React Router DOM** | Standard routing library for React SPAs. Supports nested routes, dynamic params (`:slug`), and programmatic navigation. |
| **Axios** | Promise-based HTTP client with interceptors (for attaching JWT tokens to requests) and consistent error handling. |
| **Lucide React** | Modern, lightweight icon library with tree-shaking support. Provides all necessary e-commerce icons (shopping cart, search, user, heart, etc.). |
| **npm workspaces** | Native monorepo support in npm. Allows `shared` package to be consumed by both `server` and `client` without publishing to a registry. |

### 2.3 Configuration Notes

- **TypeScript Strict Mode**: Both `server` and `client` `tsconfig.json` files must enable `"strict": true` for maximum type safety.
- **Prisma + PostgreSQL Integration**: Prisma uses the `@prisma/adapter-pg` driver adapter for direct PostgreSQL connections. The `DATABASE_URL` environment variable must be a valid PostgreSQL connection string.
- **Tailwind CSS v4**: Unlike v3, Tailwind v4 uses CSS-first configuration. The `@tailwindcss/vite` plugin handles all processing — no `postcss.config.ts` or `tailwind.config.ts` files are needed. Tailwind is imported directly in the main CSS file with `@import "tailwindcss"`.
- **Shared Package**: The `shared` workspace package contains Zod schemas and TypeScript types used by both `server` and `client`. It is referenced as `"shared": "*"` in their `package.json` dependencies and resolved via npm workspaces.

---

## 3. Monorepo Structure

### 3.1 Workspace Strategy

This project uses **npm workspaces** defined in the root `package.json`. The root manages three workspace packages:

- `shared/` — Shared Zod schemas and TypeScript types
- `server/` — Express API backend
- `client/` — Vite React frontend

All dependencies are installed from the root via `npm install`, which hoists shared dependencies and links local workspace packages.

### 3.2 Complete Folder Structure

```
parfume-marketplace/
├── .env.example                    # Template for environment variables
├── .gitignore                      # Git ignore rules
├── package.json                    # Root workspace config
├── plan.md                         # This implementation plan
├── README.md                       # Project documentation
│
├── shared/                         # Shared types & validation schemas
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Barrel export file
│       ├── schemas/
│       │   ├── auth.schema.ts      # Zod schemas for register/login payloads
│       │   └── product.schema.ts   # Zod schemas for product data
│       └── types/
│           ├── auth.types.ts       # Auth-related TypeScript types
│           └── product.types.ts    # Product-related TypeScript types
│
├── server/                         # Express API backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma schema (Product, User models)
│   │   ├── migrations/             # Auto-generated migration files
│   │   └── seed.ts                 # Database seeding script
│   └── src/
│       ├── index.ts                # Server entrypoint (starts listening)
│       ├── app.ts                  # Express app configuration & middleware
│       ├── routes/
│       │   ├── index.ts            # Route aggregator
│       │   ├── auth.routes.ts      # Auth endpoints (/api/auth/*)
│       │   └── products.routes.ts  # Product endpoints (/api/products/*)
│       ├── controllers/
│       │   ├── auth.controller.ts  # Auth request handlers
│       │   └── products.controller.ts # Product request handlers
│       ├── services/
│       │   ├── auth.service.ts     # Auth business logic (hash, verify, token)
│       │   └── products.service.ts # Product queries (list, detail, filter)
│       ├── middlewares/
│       │   ├── errorHandler.ts     # Global error handler middleware
│       │   ├── validateRequest.ts  # Zod validation middleware
│       │   └── authGuard.ts        # JWT authentication middleware
│       ├── lib/
│       │   ├── prisma.ts           # Singleton Prisma client instance
│       │   └── hash.ts             # bcrypt helper functions
│       └── types/
│           └── express.d.ts        # Express type augmentations (req.user)
│
└── client/                         # Vite React frontend
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── eslint.config.js
    ├── index.html                  # HTML entrypoint
    └── src/
        ├── main.tsx                # React DOM render entrypoint
        ├── App.tsx                 # Root component with RouterProvider
        ├── index.css               # Global CSS with Tailwind import
        ├── routes/
        │   ├── HomePage.tsx        # Home / Landing page
        │   ├── ShopPage.tsx        # Category / Listing (Shop) page
        │   ├── ProductDetailPage.tsx # Product detail page
        │   └── AuthPage.tsx        # Login / Register page
        ├── components/
        │   ├── layout/
        │   │   ├── Header.tsx      # Top navbar with logo, nav, search, cart, account
        │   │   ├── Footer.tsx      # Site footer
        │   │   └── Layout.tsx      # Shared layout wrapper (Header + Outlet + Footer)
        │   ├── home/
        │   │   ├── HeroSection.tsx           # Hero banner with CTA
        │   │   ├── FeaturedSection.tsx        # New Arrivals / Best Sellers grid
        │   │   └── ScentFamilyQuickLinks.tsx  # Scent family filter chips
        │   ├── shop/
        │   │   ├── ProductCard.tsx  # Individual product card
        │   │   ├── ProductGrid.tsx  # Responsive grid of ProductCards
        │   │   ├── FilterBar.tsx    # Category, scent family, price range filters
        │   │   └── SortDropdown.tsx # Sort-by dropdown
        │   ├── product/
        │   │   ├── ProductGallery.tsx    # Product image display
        │   │   ├── ProductInfoPanel.tsx  # Product details (notes, price, CTA)
        │   │   ├── ScentNotes.tsx        # Top/Heart/Base notes display
        │   │   └── RelatedProducts.tsx   # "You may also like" section
        │   ├── auth/
        │   │   ├── LoginForm.tsx    # Email + password login form
        │   │   ├── RegisterForm.tsx # Registration form
        │   │   └── GuestLoginCTA.tsx # "Continue as Guest" button
        │   └── ui/
        │       ├── Button.tsx       # Reusable button component
        │       ├── Input.tsx        # Reusable form input component
        │       ├── Badge.tsx        # "New", "Best Seller" badge
        │       ├── Spinner.tsx      # Loading spinner
        │       └── EmptyState.tsx   # Empty state placeholder
        ├── hooks/
        │   ├── useAuth.ts          # Auth state hook (Zustand store)
        │   └── useProducts.ts      # Product fetching hook
        ├── stores/
        │   ├── authStore.ts        # Zustand auth store
        │   └── cartStore.ts        # Zustand cart store
        ├── lib/
        │   ├── apiClient.ts        # Axios instance with interceptors
        │   ├── routes.ts           # API route constants
        │   └── cn.ts               # clsx + tailwind-merge utility
        └── types/
            └── index.ts            # Frontend-specific types
```

### 3.3 Root `package.json` (Workspace Configuration)

```json
{
  "name": "parfume-marketplace",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "shared",
    "server",
    "client"
  ],
  "scripts": {
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client",
    "build:shared": "npm run build --workspace=shared",
    "db:migrate": "npm run db:migrate --workspace=server",
    "db:seed": "npm run db:seed --workspace=server",
    "db:generate": "npm run db:generate --workspace=server"
  }
}
```

---

## 4. Domain & Data Model

### 4.1 Conceptual Model

The MVP has two core entities: **Product** and **User**.

```
┌──────────────┐           ┌──────────────┐
│   Product    │           │     User     │
├──────────────┤           ├──────────────┤
│ id           │           │ id           │
│ name         │           │ name         │
│ brand        │           │ email        │
│ slug         │           │ passwordHash │
│ category     │           │ createdAt    │
│ scentFamily  │           │ updatedAt    │
│ notesTop     │           └──────────────┘
│ notesHeart   │
│ notesBase    │      (Future: User ──1:N──> Order)
│ concentration│      (Future: Order ──1:N──> OrderItem)
│ price        │      (Future: OrderItem ──N:1──> Product)
│ volumeMl     │
│ stock        │
│ status       │
│ imageUrl     │
│ description  │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

**Relationships (MVP):**
- `Product` and `User` are **independent entities** in the MVP. There is no foreign key relationship between them.
- One `Product` can be viewed by many users (no tracking in MVP).
- One `User` can browse many products (no tracking in MVP).

**Future Relationships (not implemented in MVP):**
- One `User` → many `Order`s.
- One `Order` → many `OrderItem`s.
- One `OrderItem` → one `Product` (many-to-one).
- One `User` → many `CartItem`s (server-side cart).
- One `User` → many `Wishlist` items.

### 4.2 Product Model — Perfume-Specific Attributes

The `Product` model is designed specifically for a perfume marketplace, with attributes that capture fragrance-specific information:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary key | Auto-generated UUID |
| `name` | `String` | Perfume name (e.g., "Bleu de Chanel") | Non-empty, max 150 chars |
| `brand` | `String` | Brand name (e.g., "Chanel") | Non-empty, max 100 chars |
| `slug` | `String` | URL-friendly identifier (e.g., "bleu-de-chanel-edp-100ml") | Unique, auto-generated from name + concentration + volume |
| `category` | `Enum` | Target demographic | `MEN`, `WOMEN`, `UNISEX` |
| `scentFamily` | `Enum` | Primary fragrance family | `FLORAL`, `WOODY`, `FRESH`, `ORIENTAL`, `CITRUS`, `AQUATIC`, `GOURMAND`, `AROMATIC` |
| `notesTop` | `String` | Top/opening notes | Text, e.g., "Bergamot, Lemon, Pink Pepper" |
| `notesHeart` | `String` | Heart/middle notes | Text, e.g., "Jasmine, Rose, Iris" |
| `notesBase` | `String` | Base/dry-down notes | Text, e.g., "Sandalwood, Musk, Cedar" |
| `concentration` | `Enum` | Fragrance concentration level | `EDT` (Eau de Toilette), `EDP` (Eau de Parfum), `PARFUM`, `EDC` (Eau de Cologne) |
| `price` | `Decimal` | Price in the store's currency | >= 0, stored as `Decimal` for precision |
| `volumeMl` | `Int` | Bottle size in milliliters | > 0 |
| `stock` | `Int` | Available inventory count | >= 0, defaults to 0 |
| `status` | `Enum` | Product visibility status | `ACTIVE`, `INACTIVE` |
| `imageUrl` | `String` | URL to main product image | Valid URL string |
| `description` | `String?` | Optional longer product description | Nullable text |
| `createdAt` | `DateTime` | Record creation timestamp | Auto-set |
| `updatedAt` | `DateTime` | Last update timestamp | Auto-updated |

### 4.3 User Model

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary key | Auto-generated UUID |
| `name` | `String` | User's display name | Non-empty, max 100 chars |
| `email` | `String` | User's email address | Unique, valid email format |
| `passwordHash` | `String` | bcrypt-hashed password | Never exposed in API responses |
| `createdAt` | `DateTime` | Account creation timestamp | Auto-set |
| `updatedAt` | `DateTime` | Last update timestamp | Auto-updated |

### 4.4 Prisma Schema Definition

The following `schema.prisma` file defines both models with PostgreSQL-specific types:

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  MEN
  WOMEN
  UNISEX
}

enum ScentFamily {
  FLORAL
  WOODY
  FRESH
  ORIENTAL
  CITRUS
  AQUATIC
  GOURMAND
  AROMATIC
}

enum Concentration {
  EDT
  EDP
  PARFUM
  EDC
}

enum ProductStatus {
  ACTIVE
  INACTIVE
}

model Product {
  id            String        @id @default(uuid())
  name          String        @db.VarChar(150)
  brand         String        @db.VarChar(100)
  slug          String        @unique @db.VarChar(200)
  category      Category
  scentFamily   ScentFamily
  notesTop      String        @db.Text
  notesHeart    String        @db.Text
  notesBase     String        @db.Text
  concentration Concentration
  price         Decimal       @db.Decimal(10, 2)
  volumeMl      Int
  stock         Int           @default(0)
  status        ProductStatus @default(ACTIVE)
  imageUrl      String        @db.Text
  description   String?       @db.Text
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("products")
}

model User {
  id           String   @id @default(uuid())
  name         String   @db.VarChar(100)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}
```

### 4.5 Validation Rules (Zod Schemas)

These Zod schemas live in the `shared` package and are used by both server and client:

**Product validation (`shared/src/schemas/product.schema.ts`):**

```typescript
import { z } from "zod";

export const CategoryEnum = z.enum(["MEN", "WOMEN", "UNISEX"]);
export const ScentFamilyEnum = z.enum([
  "FLORAL", "WOODY", "FRESH", "ORIENTAL",
  "CITRUS", "AQUATIC", "GOURMAND", "AROMATIC",
]);
export const ConcentrationEnum = z.enum(["EDT", "EDP", "PARFUM", "EDC"]);
export const ProductStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(150, "Name too long"),
  brand: z.string().min(1, "Brand is required").max(100, "Brand too long"),
  category: CategoryEnum,
  scentFamily: ScentFamilyEnum,
  notesTop: z.string().min(1, "Top notes are required"),
  notesHeart: z.string().min(1, "Heart notes are required"),
  notesBase: z.string().min(1, "Base notes are required"),
  concentration: ConcentrationEnum,
  price: z.number().min(0, "Price must be non-negative"),
  volumeMl: z.number().int().positive("Volume must be greater than 0"),
  stock: z.number().int().min(0).default(0),
  status: ProductStatusEnum.default("ACTIVE"),
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
});

export const ProductQuerySchema = z.object({
  category: CategoryEnum.optional(),
  scentFamily: ScentFamilyEnum.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["priceAsc", "priceDesc", "latest", "popular"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().optional(),
});
```

**Auth validation (`shared/src/schemas/auth.schema.ts`):**

```typescript
import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
```

### 4.6 Database Setup & Migrations

1. **Initial migration**: After defining the schema, run:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```
   This creates the `products` and `users` tables in PostgreSQL and generates the Prisma client.

2. **Generate client** (if schema changes without migration):
   ```bash
   npx prisma generate
   ```

3. **`.env` configuration**: The `DATABASE_URL` must be set in `server/.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/parfume_marketplace?schema=public"
   ```

---

## 5. Backend Design (API, Auth, Data)

### 5.1 Server Setup

The Express server is structured with a clear separation of concerns:

**Entrypoint (`server/src/index.ts`):**
- Loads environment variables via `dotenv/config`.
- Imports the configured Express `app` from `app.ts`.
- Starts listening on `process.env.PORT` (default: `3000`).

**App configuration (`server/src/app.ts`):**
- Creates an Express application.
- Applies middleware in this order:
  1. `express.json()` — Parses JSON request bodies.
  2. `cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true })` — Allows frontend origin.
  3. Route mounts (see below).
  4. `errorHandler` — Global error handler (must be last).

**Middleware stack:**

| Middleware | File | Purpose |
|-----------|------|---------|
| `express.json()` | Built-in | Parse JSON bodies |
| `cors()` | `cors` package | Allow cross-origin requests from the React frontend |
| `validateRequest(schema)` | `middlewares/validateRequest.ts` | Validate `req.body` or `req.query` against a Zod schema; returns 400 with error details on failure |
| `authGuard` | `middlewares/authGuard.ts` | Verifies JWT from `Authorization: Bearer <token>` header; attaches `req.user` with `{ id, email }`; returns 401 if invalid |
| `errorHandler` | `middlewares/errorHandler.ts` | Catches all errors; returns consistent JSON: `{ success: false, message: string, errors?: any }` |

### 5.2 Authentication Design

**Mechanism: JWT (JSON Web Tokens)**

JWT is chosen over session cookies for this MVP because:
- **Stateless**: No server-side session storage required. The token contains all necessary user information.
- **Simple frontend integration**: The token is stored in the Zustand auth store (and optionally `localStorage`) and attached to requests via the `Authorization` header.
- **Scalable**: Tokens work across multiple server instances without shared session storage.

**Auth Flow:**

```
┌─────────┐     POST /api/auth/register      ┌─────────┐
│  Client  │ ──────────────────────────────── │  Server │
│          │     { name, email, password }     │         │
│          │ <─────────────────────────────── │         │
│          │     { user, token }               │         │
│          │                                   │         │
│          │     POST /api/auth/login          │         │
│          │ ──────────────────────────────── │         │
│          │     { email, password }           │         │
│          │ <─────────────────────────────── │         │
│          │     { user, token }               │         │
│          │                                   │         │
│          │     GET /api/auth/me              │         │
│          │     Authorization: Bearer <jwt>   │         │
│          │ ──────────────────────────────── │         │
│          │ <─────────────────────────────── │         │
│          │     { user }                      │         │
└─────────┘                                   └─────────┘
```

**Auth Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Create a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Protected | Get current user's profile |

**Endpoint Details:**

**`POST /api/auth/register`**
- **Request body**: `{ name: string, email: string, password: string, confirmPassword: string }`
- **Validation**: Uses `RegisterSchema` from `shared`.
- **Logic**:
  1. Check if email already exists → 409 Conflict if so.
  2. Hash password with `bcrypt.hash(password, 10)` (10 salt rounds).
  3. Create user in database via Prisma.
  4. Generate JWT with `jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })`.
  5. Return `{ success: true, data: { user: { id, name, email }, token } }`.
- **Response**: `201 Created`.

**`POST /api/auth/login`**
- **Request body**: `{ email: string, password: string }`
- **Validation**: Uses `LoginSchema` from `shared`.
- **Logic**:
  1. Find user by email → 401 if not found.
  2. Compare password with `bcrypt.compare(password, user.passwordHash)` → 401 if mismatch.
  3. Generate JWT (same as register).
  4. Return `{ success: true, data: { user: { id, name, email }, token } }`.
- **Response**: `200 OK`.

**`GET /api/auth/me`**
- **Headers**: `Authorization: Bearer <jwt>`
- **Middleware**: `authGuard`
- **Logic**:
  1. Extract user ID from verified token.
  2. Fetch user from database (exclude `passwordHash`).
  3. Return `{ success: true, data: { user: { id, name, email } } }`.
- **Response**: `200 OK`.

**Password Handling (`server/src/lib/hash.ts`):**

```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**JWT Configuration:**
- **Secret**: Stored in `JWT_SECRET` environment variable (minimum 32 characters).
- **Expiration**: 7 days (`"7d"`).
- **Payload**: `{ id: string, email: string }`.

### 5.3 Guest Access Policy

Guest access is fundamental to e-commerce UX — forcing registration before browsing kills conversion.

| Resource | Guest Access | Notes |
|----------|-------------|-------|
| `GET /api/products` | ✅ Public | All users can browse |
| `GET /api/products/:slug` | ✅ Public | All users can view details |
| `POST /api/auth/register` | ✅ Public | Create account |
| `POST /api/auth/login` | ✅ Public | Authenticate |
| `GET /api/auth/me` | 🔒 Protected | Requires valid JWT |

**Cart for Guests**: The cart is managed entirely on the frontend using Zustand + `localStorage`. No server-side cart endpoints exist in this MVP. Guest cart data persists across browser sessions via `localStorage` but is not associated with any user account.

### 5.4 Product API Design

**Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | List products with filters, sorting, and pagination |
| `GET` | `/api/products/:slug` | Public | Get single product by slug |
| `POST` | `/api/products` | Internal | Create product (used for seeding only, not exposed in frontend) |
| `PUT` | `/api/products/:id` | Internal | Update product (seeding/admin only) |
| `DELETE` | `/api/products/:id` | Internal | Delete product (seeding/admin only) |

> **Note on admin endpoints**: `POST`, `PUT`, and `DELETE` endpoints are implemented for internal use (seeding scripts, future admin panel) but are **not consumed by the MVP frontend**. They may optionally be protected with `authGuard` or a future admin role check.

**`GET /api/products` — Listing with Filters**

| Query Param | Type | Description | Example |
|-------------|------|-------------|---------|
| `category` | `string` | Filter by category | `?category=MEN` |
| `scentFamily` | `string` | Filter by scent family | `?scentFamily=WOODY` |
| `minPrice` | `number` | Minimum price | `?minPrice=50` |
| `maxPrice` | `number` | Maximum price | `?maxPrice=200` |
| `sort` | `string` | Sort order | `?sort=priceAsc` |
| `search` | `string` | Search by name or brand | `?search=chanel` |
| `page` | `number` | Page number (1-based) | `?page=2` |
| `limit` | `number` | Items per page (max 50) | `?limit=12` |

**Response format:**

```json
{
  "success": true,
  "data": {
    "products": [ /* array of Product objects */ ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 48,
      "totalPages": 4
    }
  }
}
```

**Sorting logic:**

| Sort Value | Prisma `orderBy` |
|-----------|------------------|
| `priceAsc` | `{ price: "asc" }` |
| `priceDesc` | `{ price: "desc" }` |
| `latest` | `{ createdAt: "desc" }` |
| `popular` | `{ stock: "desc" }` (placeholder — real popularity tracking is a future feature) |

**Filtering logic (`server/src/services/products.service.ts`):**
- Build a Prisma `where` clause dynamically:
  - Always include `status: "ACTIVE"` (never show inactive products to customers).
  - Add `category`, `scentFamily` filters if provided.
  - Add `price: { gte: minPrice, lte: maxPrice }` if provided.
  - Add `OR: [{ name: { contains: search, mode: "insensitive" } }, { brand: { contains: search, mode: "insensitive" } }]` for search.
- Use `skip` and `take` for pagination.
- Count total matching products for pagination metadata.

**`GET /api/products/:slug` — Product Detail**

- **Params**: `slug` (string) from URL.
- **Logic**: `prisma.product.findUnique({ where: { slug } })`.
- **Response**: `{ success: true, data: { product: Product } }`.
- **Error**: 404 if not found → `{ success: false, message: "Product not found" }`.

### 5.5 Request Validation Middleware

The `validateRequest` middleware is a reusable function that validates request data against Zod schemas:

```typescript
// server/src/middlewares/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validateRequest(
  schema: ZodSchema,
  target: ValidationTarget = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    req[target] = result.data; // Replace with parsed & validated data
    next();
  };
}
```

### 5.6 Error Handler Middleware

All errors are caught by a central error handler that returns a consistent JSON format:

```typescript
// server/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${err.message}`, err.stack);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
}
```

### 5.7 Data Seeding Strategy

A seeding script populates the database with sample perfume products for development and testing.

**File**: `server/prisma/seed.ts`

**Approach**:
1. Define an array of 15–20 sample perfume products with realistic data (real perfume names, brands, notes, prices).
2. Use `prisma.product.upsert()` to avoid duplicates when re-running the seed.
3. Create a test user account for development.

**Script added to `server/package.json`**:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Run with**: `npx prisma db seed`

**Sample seed data categories** (15–20 products spanning all categories):
- Men's fragrances: Bleu de Chanel EDP, Dior Sauvage EDT, Tom Ford Oud Wood, etc.
- Women's fragrances: Chanel No. 5 EDP, Miss Dior, Flowerbomb, etc.
- Unisex fragrances: Le Labo Santal 33, Byredo Gypsy Water, etc.

Each product includes realistic top/heart/base notes, concentration, price range ($50–$400), and stock quantities.

---

## 6. Frontend Design (Pages & Components)

### 6.1 Router Configuration

Using React Router v6 with `createBrowserRouter`:

```typescript
// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./routes/HomePage";
import ShopPage from "./routes/ShopPage";
import ProductDetailPage from "./routes/ProductDetailPage";
import AuthPage from "./routes/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "auth", element: <AuthPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

### 6.2 Shared Layout

**`Layout.tsx`** wraps all pages with a consistent structure:

```
┌─────────────────────────────────────────┐
│                 Header                  │
│  Logo | Home | Shop | Search | Cart | 👤 │
├─────────────────────────────────────────┤
│                                         │
│              <Outlet />                 │
│         (Page content renders here)     │
│                                         │
├─────────────────────────────────────────┤
│                 Footer                  │
│   About | Help | Contact | © 2026       │
└─────────────────────────────────────────┘
```

**Header (`components/layout/Header.tsx`):**
- **Logo**: "PARFUME" text logo or brand mark — links to `/`.
- **Navigation links**: Home (`/`), Shop (`/shop`).
- **Search box**: Text input with search icon. On submit/enter, navigates to `/shop?search=<query>`.
- **Cart icon**: Shopping bag icon from Lucide with item count badge. Clicking opens a cart drawer or navigates to a future cart page. In MVP, shows the number of items from the Zustand cart store.
- **Account icon/link**:
  - If logged in: shows user name or avatar, with a dropdown for "My Account" (future) and "Logout".
  - If guest: shows "Login" link → `/auth`.

**Footer (`components/layout/Footer.tsx`):**
- Minimal footer with three columns:
  - **Brand**: Logo and short tagline.
  - **Links**: About, Help, Contact (placeholder pages or anchors).
  - **Legal**: "© 2026 Marketplace for Parfume. All rights reserved."

### 6.3 State Management

**Zustand Stores:**

**Auth Store (`stores/authStore.ts`):**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  login: (user: User, token: string) => void;
  register: (user: User, token: string) => void;
  logout: () => void;
  setGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isGuest: false,
      login: (user, token) => set({ user, token, isGuest: false }),
      register: (user, token) => set({ user, token, isGuest: false }),
      logout: () => set({ user: null, token: null, isGuest: false }),
      setGuest: () => set({ user: null, token: null, isGuest: true }),
    }),
    { name: "auth-storage" }
  )
);
```

**Cart Store (`stores/cartStore.ts`):**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  volumeMl: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
```

### 6.4 API Client

**`lib/apiClient.ts`:**

```typescript
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**`lib/routes.ts` (API route constants):**

```typescript
export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (slug: string) => `/products/${slug}`,
  },
} as const;
```

### 6.5 Custom Hooks

**`hooks/useAuth.ts`:**
- Wraps the auth store and API calls.
- Provides `login(email, password)`, `register(name, email, password, confirmPassword)`, `logout()`, and `continueAsGuest()` functions.
- Handles API errors and returns validation error messages.

**`hooks/useProducts.ts`:**
- Provides `fetchProducts(filters)` for the listing page.
- Provides `fetchProductBySlug(slug)` for the detail page.
- Manages loading, error, and data states.
- Accepts filter/sort/pagination parameters.

### 6.6 Utility: `cn()` (Class Name Merger)

**`lib/cn.ts`:**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This utility combines `clsx` (conditional class names) with `tailwind-merge` (resolves Tailwind class conflicts).

---

## 7. Visual Design System (Typography, Colors, UI Style)

This section defines a **consistent visual design system** for the perfume marketplace. The goal is to achieve a **modern premium / niche fragrance** aesthetic — similar to luxury perfume e-commerce websites — while keeping the UI readable and implementation-friendly.

All design tokens, typography rules, and component styles defined here must be applied consistently across every page (Home, Shop, Product Detail, Auth) and every reusable component.

### 7.1 Typography System

The typography system uses a **dual-font strategy** that is standard in luxury e-commerce design: a **serif display font** for brand personality and emotional impact, paired with a **sans-serif font** for clarity and readability in UI elements.

This combination follows common luxury perfume UI patterns — serif for brand feel + sans-serif for clarity — as seen in modern perfume e-commerce UI references on Behance and Figma (e.g., PARFS Perfume Ecommerce, Bliss Fragrance Store UI).

#### Font Families

| Role | Font Family | Fallback Stack | Usage |
|------|-----------|----------------|-------|
| **Display / Headings** | Playfair Display | Georgia, serif | Logo wordmark, hero headlines, section titles, product names on detail page |
| **Body / UI** | Inter | system-ui, -apple-system, sans-serif | Body text, product descriptions, form labels, buttons, navigation, captions |

**Loading**: Both fonts are loaded via Google Fonts with only the required weights to minimize performance impact:

```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap
```

#### Type Scale & Hierarchy

| Element | Font | Weight | Size (Desktop) | Line Height | Letter Spacing | Usage |
|---------|------|--------|----------------|-------------|----------------|-------|
| **H1** | Playfair Display | 700 | 48px (3rem) | 1.2 | -0.02em | Hero headline, page titles |
| **H2** | Playfair Display | 600 | 32px (2rem) | 1.25 | -0.01em | Section titles ("New Arrivals", "Best Sellers") |
| **H3** | Playfair Display | 600 | 24px (1.5rem) | 1.3 | 0 | Product name on detail page, subsection headings |
| **H4** | Inter | 600 | 20px (1.25rem) | 1.4 | 0 | Card titles, filter section labels |
| **Body Large** | Inter | 400 | 16px (1rem) | 1.7 | 0 | Product descriptions, paragraphs |
| **Body** | Inter | 400 | 14px (0.875rem) | 1.6 | 0 | General UI text, form labels |
| **Body Small** | Inter | 500 | 13px (0.8125rem) | 1.5 | 0.01em | Brand names on cards, meta info |
| **Caption** | Inter | 400 | 12px (0.75rem) | 1.5 | 0.02em | Timestamps, footnotes, helper text |
| **Overline** | Inter | 600 | 11px (0.6875rem) | 1.4 | 0.08em | Uppercase labels ("EDP", "NEW"), badges |

#### Responsive Typography Adjustments

| Element | Desktop | Tablet (≤ 768px) | Mobile (≤ 480px) |
|---------|---------|-------------------|------------------|
| H1 | 48px | 36px | 28px |
| H2 | 32px | 28px | 24px |
| H3 | 24px | 22px | 20px |
| Body Large | 16px | 16px | 15px |
| Body | 14px | 14px | 14px |

#### Tailwind v4 CSS Token Mapping

```css
@theme {
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-display: "Playfair Display", Georgia, serif;
}
```

Usage in components: `font-display` for headings, `font-sans` (default) for everything else.

---

### 7.2 Color Palette & Tokens

The color palette is designed for a **premium perfume marketplace** — light, warm neutral backgrounds combined with deep, rich primary tones and a subtle metallic accent. This aligns with luxury e-commerce best practices: white/off-white base + rich dark + subtle accent metallic, as seen in high-end fragrance retail sites.

#### Primary Palette — "Modern Premium"

| Token | Hex | Swatch | Role |
|-------|-----|--------|------|
| `color-bg` | `#FAF7F4` | 🟫 warm white / light cream | Main page background |
| `color-bg-alt` | `#F5F0E8` | 🟫 slightly darker cream | Card backgrounds, highlighted sections, alternate rows |
| `color-bg-dark` | `#111827` | ⬛ deep navy | Dark sections (footer, hero overlays) |
| `color-text-main` | `#111111` | ⬛ near-black | Primary body text, headings |
| `color-text-muted` | `#6B7280` | 🔘 warm gray | Secondary text, meta info, placeholders |
| `color-text-light` | `#9CA3AF` | ⚪ light gray | Disabled text, subtle labels |
| `color-primary` | `#111827` | ⬛ deep navy / charcoal | Main CTAs, primary buttons, navigation text on light bg |
| `color-primary-hover` | `#1F2937` | ⬛ lighter charcoal | Hover state for primary buttons |
| `color-secondary` | `#B08A6A` | 🟤 warm taupe / tan | Secondary buttons, brand accents, badges |
| `color-secondary-hover` | `#9A7558` | 🟤 darker taupe | Hover state for secondary elements |
| `color-accent` | `#B76E79` | 🔴 copper / rose gold | Small highlights, decorative borders, icons, taglines |
| `color-accent-light` | `#D4A0A7` | 🔴 light rose | Subtle accent backgrounds, hover tints |
| `color-border` | `#E5E7EB` | ⚪ neutral gray | Input borders, card borders, dividers |
| `color-border-focus` | `#111827` | ⬛ matches primary | Input focus state border |

#### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | `#16A34A` | "In Stock" label, success messages |
| `color-error` | `#DC2626` | Form validation errors, "Out of Stock" label |
| `color-warning` | `#F59E0B` | Low stock warnings |
| `color-info` | `#3B82F6` | Informational badges, tooltips |

#### Color Application Rules

| Context | Token(s) | Notes |
|---------|----------|-------|
| Page background | `color-bg` | Warm cream base for the entire viewport |
| Product cards, filter panels | `color-bg-alt` | Slightly darker cream to create visual layering |
| Primary CTA buttons | `color-primary` bg + white text | "Shop Now", "Add to Cart", "Login" |
| Secondary buttons | `color-primary` border + transparent bg + `color-primary` text | "Continue Shopping", "Reset Filters" |
| Accent decorations | `color-accent` | Thin underlines below headings, small icons, heart/wishlist icons |
| Hover on product cards | `color-accent` border-bottom or subtle shadow | Creates warmth on interaction |
| Navigation links | `color-text-main` with `color-accent` on hover | Clean, readable navigation |
| Footer | `color-bg-dark` bg + white / `color-text-light` text | Visual grounding at page bottom |
| Form inputs | white bg + `color-border` border → `color-border-focus` on focus | Clear input areas on cream backgrounds |

#### Contrast & Accessibility

- `color-text-main` (#111111) on `color-bg` (#FAF7F4) → **contrast ratio ≈ 17.4:1** (WCAG AAA).
- `color-text-muted` (#6B7280) on `color-bg` (#FAF7F4) → **contrast ratio ≈ 5.1:1** (WCAG AA).
- White (#FFFFFF) on `color-primary` (#111827) → **contrast ratio ≈ 17.1:1** (WCAG AAA).
- All text/background combinations must meet at minimum **WCAG AA** (4.5:1 for normal text, 3:1 for large text).

#### Tailwind v4 CSS Token Mapping

```css
@theme {
  /* Backgrounds */
  --color-bg: #FAF7F4;
  --color-bg-alt: #F5F0E8;
  --color-bg-dark: #111827;

  /* Text */
  --color-text-main: #111111;
  --color-text-muted: #6B7280;
  --color-text-light: #9CA3AF;

  /* Primary */
  --color-primary: #111827;
  --color-primary-hover: #1F2937;

  /* Secondary */
  --color-secondary: #B08A6A;
  --color-secondary-hover: #9A7558;

  /* Accent */
  --color-accent: #B76E79;
  --color-accent-light: #D4A0A7;

  /* Borders */
  --color-border: #E5E7EB;
  --color-border-focus: #111827;

  /* Status */
  --color-success: #16A34A;
  --color-error: #DC2626;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
}
```

Usage examples: `bg-bg`, `bg-bg-alt`, `text-text-main`, `text-text-muted`, `bg-primary`, `hover:bg-primary-hover`, `border-border`, `text-accent`.

---

### 7.3 Layout, Grid & Spacing

The layout system prioritizes **ample whitespace** and **clean alignment** to create a premium, unhurried browsing experience — similar to luxury perfume store designs where space itself communicates quality.

#### Grid System

| Parameter | Value | Notes |
|-----------|-------|-------|
| Grid type | 12-column CSS Grid | Standard for responsive e-commerce layouts |
| Gutter width | 24px (tablet) / 32px (desktop) | Generous gutters prevent visual clutter |
| Max content width | 1280px | Main content container (`max-w-7xl` in Tailwind) |
| Extended max width | 1440px | For hero sections and full-bleed backgrounds |
| Container padding | 16px (mobile) / 24px (tablet) / 32px (desktop) | Horizontal padding inside the content container |

#### Spacing Scale

Use a consistent spacing scale based on a **4px base unit**:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon margins |
| `space-2` | 8px | Inline spacing, small gaps |
| `space-3` | 12px | Input padding, badge padding |
| `space-4` | 16px | Card padding, list item gaps |
| `space-5` | 20px | Form field spacing |
| `space-6` | 24px | Component margins, grid gaps |
| `space-8` | 32px | Section header margins |
| `space-10` | 40px | Subsection vertical spacing |
| `space-12` | 48px | Section vertical spacing (mobile) |
| `space-16` | 64px | Section vertical spacing (tablet) |
| `space-20` | 80px | Section vertical spacing (desktop) |
| `space-24` | 96px | Major section spacing (desktop) |

#### Section Spacing Rules

| Context | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Between major sections (Hero → Featured, Featured → Best Sellers) | 80–96px | 64px | 48px |
| Between section title and content | 32–40px | 24px | 20px |
| Between product grid rows | 32px | 24px | 20px |
| Between product grid columns | 24–32px | 20px | 16px |

#### Card & Container Shapes

| Element | Border Radius | Shadow |
|---------|--------------|--------|
| Product cards | 8px | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` (rest) → `0 10px 25px rgba(0,0,0,0.08)` (hover) |
| Modals / Dialogs | 12px | `0 20px 60px rgba(0,0,0,0.15)` |
| Input fields | 6px | None (border only) |
| Buttons | 6px | None (or subtle on primary CTA) |
| Filter chips | 9999px (pill) | None |
| Badges | 4px | None |
| Auth card | 12px | `0 4px 24px rgba(0,0,0,0.08)` |

#### Responsive Breakpoints

| Name | Min Width | Columns | Container Padding |
|------|-----------|---------|-------------------|
| Mobile | 0px | 1–2 | 16px |
| Tablet | 768px | 2–3 | 24px |
| Desktop | 1024px | 3–4 | 32px |
| Wide | 1280px | 4 | 32px |

---

### 7.4 UI Components Style

All component styles are implemented as reusable Tailwind utility compositions or small wrapper components (`Button.tsx`, `Input.tsx`, `Badge.tsx`) to ensure consistency across Home, Shop, Product Detail, and Auth pages.

#### Buttons

**Primary Button** — for main CTAs ("Shop Now", "Add to Cart", "Login", "Create Account"):

| Property | Value |
|----------|-------|
| Background | `color-primary` (#111827) |
| Text color | White (#FFFFFF) |
| Font | Inter, weight 600, size 14–15px |
| Height | 48px |
| Padding | 16px 32px |
| Border radius | 6px |
| Hover | `color-primary-hover` (#1F2937), optional subtle shadow `0 4px 12px rgba(0,0,0,0.15)` |
| Active | Scale 0.98 transform |
| Disabled | Opacity 0.5, cursor not-allowed |
| Transition | `all 200ms ease` |

```html
<!-- Example Tailwind classes -->
<button class="bg-primary hover:bg-primary-hover text-white font-semibold
               h-12 px-8 rounded-md transition-all duration-200
               active:scale-[0.98] disabled:opacity-50">
  Shop Now
</button>
```

**Secondary Button** — for secondary actions ("Continue Shopping", "Reset Filters", "Continue as Guest"):

| Property | Value |
|----------|-------|
| Background | Transparent |
| Text color | `color-primary` (#111827) |
| Border | 1px solid `color-primary` |
| Height | 48px |
| Border radius | 6px |
| Hover | `color-bg-alt` background (#F5F0E8) |

**Ghost Button** — for tertiary/link-style actions:

| Property | Value |
|----------|-------|
| Background | Transparent |
| Text color | `color-text-muted` |
| Border | None |
| Hover | `color-text-main` text, subtle underline |

#### Input Fields & Forms

| Property | Rest State | Focus State | Error State |
|----------|-----------|-------------|-------------|
| Background | White (#FFFFFF) | White (#FFFFFF) | White (#FFFFFF) |
| Border | 1px solid `color-border` (#E5E7EB) | 1.5px solid `color-border-focus` (#111827) | 1.5px solid `color-error` (#DC2626) |
| Border radius | 6px | 6px | 6px |
| Height | 44–48px | — | — |
| Padding | 12px 16px | — | — |
| Text | `color-text-main` 14px | — | — |
| Placeholder | `color-text-light` (#9CA3AF) | — | — |
| Shadow | None | `0 0 0 3px rgba(17,24,39,0.06)` (subtle glow) | `0 0 0 3px rgba(220,38,38,0.08)` |
| Label | `color-text-main` 14px Inter 500, above input with 6px gap | — | — |
| Error message | — | — | `color-error` 12px Inter 400, below input with 4px gap |
| Transition | `border-color 200ms ease, box-shadow 200ms ease` | — | — |

**Password visibility toggle**: An eye icon (from Lucide: `Eye` / `EyeOff`) positioned inside the input field on the right side.

#### Product Cards

| Property | Value |
|----------|-------|
| Background | `color-bg-alt` (#F5F0E8) |
| Border radius | 8px |
| Overflow | Hidden (for image) |
| Shadow (rest) | `0 1px 3px rgba(0,0,0,0.06)` |
| Shadow (hover) | `0 10px 25px rgba(0,0,0,0.08)` |
| Hover transform | `translateY(-2px)` |
| Transition | `all 300ms ease` |
| Cursor | Pointer (entire card is clickable) |

**Card content layout (top to bottom):**

| Element | Font | Size | Color | Notes |
|---------|------|------|-------|-------|
| Product image | — | Aspect ratio 3:4, object-fit cover | — | Full width of card |
| Badge overlay (if applicable) | Inter 600 | 11px uppercase | White on `color-accent` bg | Positioned top-left with 8px offset |
| Brand name | Inter 500 | 12px uppercase | `color-text-muted` | 0.05em letter-spacing |
| Product name | Playfair Display 600 | 16px | `color-text-main` | Max 2 lines, ellipsis overflow |
| Concentration pill | Inter 500 | 11px | `color-secondary` text, `color-secondary/10` bg | e.g., "EDP" in a small pill |
| Price | Inter 700 | 18px | `color-text-main` | Currency formatted |
| Content padding | — | 16px all sides | — | Inside the text area below the image |

#### Filter Chips

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Default | `color-bg-alt` (#F5F0E8) | `color-text-main` | None |
| Hover | `color-bg-alt` darkened slightly | `color-text-main` | None |
| Active / Selected | `color-primary` (#111827) | White (#FFFFFF) | None |
| Sizing | Height 36px, padding 8px 16px, border-radius 9999px (pill) | | |
| Font | Inter 500, 13px | | |
| Transition | `all 200ms ease` | | |

#### Sort Dropdown

| Property | Value |
|----------|-------|
| Style | Clean custom select with chevron icon |
| Background | White (#FFFFFF) |
| Border | 1px solid `color-border` |
| Border radius | 6px |
| Height | 40px |
| Font | Inter 400, 14px |
| Chevron | `ChevronDown` icon from Lucide |

---

### 7.5 Imagery & Visual Atmosphere

Imagery is critical in a perfume marketplace — since users cannot smell the product online, photography and visual atmosphere must convey the sensory experience.

#### Product Photography Guidelines

| Guideline | Specification |
|-----------|---------------|
| Resolution | Minimum 800×1000px for card thumbnails, 1200×1500px for detail page |
| Aspect ratio | 3:4 (portrait) for product cards, square (1:1) optional for grid views |
| Background | Neutral or slightly warm tone matching `color-bg` / `color-bg-alt`. Avoid pure white — use warm off-white (#FAF7F4 or similar) |
| Lighting | Soft, even lighting. Avoid harsh shadows or overly dramatic contrast |
| Framing | Centered bottle, consistent positioning across all products. Show 70–80% of frame filled by the product |
| Consistency | All product images must use the same background tone, lighting direction, and framing style to create a cohesive catalog |

#### Hero Section Imagery

| Guideline | Specification |
|-----------|---------------|
| Content | Large, atmospheric images: perfume bottles artfully arranged, close-ups of ingredients (citrus peels, flowers, wood), or lifestyle scenes |
| Treatment | Apply a subtle dark gradient overlay (e.g., `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1))`) to ensure text readability |
| Resolution | Minimum 1920×1080px for full-width hero |
| Color harmony | Images should harmonize with the warm cream + deep navy palette. Avoid neon, overly saturated, or cold-toned photos |

#### Visual Atmosphere Principles

- **Curated boutique feel**: The imagery should make the marketplace feel like a **modern perfume boutique**, not a generic retail warehouse. Every image should feel intentional and curated.
- **Warmth over clinical**: Prefer warm tones (ambers, creams, soft golds) over cool sterile whites. This aligns with the sensory nature of fragrance.
- **Avoid visual clutter**: Use generous whitespace around images. Let products breathe. One beautifully presented bottle is worth more than a cluttered collage.
- **Consistency is premium**: A catalog where every product image follows the same style signals quality and attention to detail. Inconsistent photography immediately undercuts the premium positioning.

#### Placeholder Images (Development)

For development before real product photography is available, use placeholder images that approximate the final look:

```
https://placehold.co/800x1000/F5F0E8/111827?text=Product+Name&font=playfair-display
```

This generates placeholders with the correct warm background (`color-bg-alt`) and dark text (`color-primary`), maintaining the palette even during development.

---

### 7.6 References & Inspiration

The visual design system described above was derived from analysis of modern perfume e-commerce design patterns. The following references were used for **visual and UX inspiration only** — the implementation is fully original.

| Reference | Inspiration Drawn |
|-----------|-------------------|
| **PARFS — Perfume Ecommerce Website** (Behance) | Typography hierarchy (serif display + sans-serif body), clean product card layout, generous whitespace, premium section spacing |
| **Bliss Fragrance — Perfume Store UI** (Figma Community) | Full-page layout composition, modern premium fragrance styling, color palette with warm neutrals, product detail page two-column structure |
| **Weblium Perfume Store Template** | Hero section storytelling with atmospheric imagery, neutral backgrounds, CTA placement patterns |
| **Luxury e-commerce UX best practices** | Navigation patterns, filter visibility, sort accessibility, mobile-first responsive considerations |
| **Color palette research** (luxury/fashion e-commerce) | Warm white/cream base (#FAF7F4) + deep dark primary (#111827) + metallic/rose accent — a pattern common across Chanel, Diptyque, and Le Labo digital retail |

> **Note**: These references inform the design direction. No assets, code, or exact layouts are copied. The implementation must remain original and be built from scratch using the Tailwind CSS utility system.

---

### 7.7 Complete Tailwind v4 Theme Configuration

The following is the **complete `@theme` block** for `client/src/index.css`, combining all tokens from this design system:

```css
@import "tailwindcss";

/* Import Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap");

/* ========================================
   Visual Design System — Tailwind v4 Theme
   ======================================== */
@theme {
  /* --- Typography --- */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-display: "Playfair Display", Georgia, serif;

  /* --- Backgrounds --- */
  --color-bg: #FAF7F4;
  --color-bg-alt: #F5F0E8;
  --color-bg-dark: #111827;

  /* --- Text --- */
  --color-text-main: #111111;
  --color-text-muted: #6B7280;
  --color-text-light: #9CA3AF;

  /* --- Primary --- */
  --color-primary: #111827;
  --color-primary-hover: #1F2937;

  /* --- Secondary --- */
  --color-secondary: #B08A6A;
  --color-secondary-hover: #9A7558;

  /* --- Accent --- */
  --color-accent: #B76E79;
  --color-accent-light: #D4A0A7;

  /* --- Borders --- */
  --color-border: #E5E7EB;
  --color-border-focus: #111827;

  /* --- Status --- */
  --color-success: #16A34A;
  --color-error: #DC2626;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
}

/* ========================================
   Base Styles
   ======================================== */
body {
  background-color: var(--color-bg);
  color: var(--color-text-main);
  font-family: var(--font-sans);
}
```

> This replaces the previous placeholder `@theme` block. All components should reference these tokens via Tailwind classes: `bg-bg`, `bg-bg-alt`, `text-text-main`, `text-text-muted`, `bg-primary`, `hover:bg-primary-hover`, `text-accent`, `border-border`, etc.

---

## 8. Page-by-Page UI/UX Specification

### 8.1 Home / Landing Page (`/`)

**Purpose**: Create an aspirational first impression. Invite exploration. Drive traffic to the Shop page.

**Layout (top to bottom):**

```
┌─────────────────────────────────────────────────┐
│                  HEADER / NAV                    │
├─────────────────────────────────────────────────┤
│                                                  │
│              ╔═══════════════════╗               │
│              ║   HERO SECTION    ║               │
│              ║                   ║               │
│              ║  Full-width bg    ║               │
│              ║  image/gradient   ║               │
│              ║                   ║               │
│              ║  "Discover Your   ║               │
│              ║   Signature       ║               │
│              ║   Scent"          ║               │
│              ║                   ║               │
│              ║  [Shop Now]       ║               │
│              ╚═══════════════════╝               │
│                                                  │
│  ── Scent Family Quick Links ──                  │
│  [Floral] [Woody] [Fresh] [Oriental] [Citrus]   │
│                                                  │
│  ── New Arrivals ──                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │ P1 │ │ P2 │ │ P3 │ │ P4 │  (Product cards)   │
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                  │
│  ── Best Sellers ──                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │ P5 │ │ P6 │ │ P7 │ │ P8 │  (Product cards)   │
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                  │
│  ── Brand Strip (Optional) ──                    │
│  [Chanel] [Dior] [Tom Ford] [Jo Malone] [...]    │
│                                                  │
├─────────────────────────────────────────────────┤
│                    FOOTER                        │
└─────────────────────────────────────────────────┘
```

**Components & Details:**

#### HeroSection (`components/home/HeroSection.tsx`)

- **Visual**: Full-width section with a luxurious background — either a high-quality perfume image or a dark gradient with ambient lighting effects.
- **Content**:
  - **Headline**: "Discover Your Signature Scent" (large, elegant typography).
  - **Subtext**: "Explore our curated collection of authentic designer and niche fragrances."
  - **Primary CTA button**: "Shop Now" → navigates to `/shop`.
  - **Secondary CTA** (optional): "Explore Collections" → scrolls to featured section.
- **Styling**: Minimum height of `80vh`. Text centered or left-aligned with ample whitespace. Dark overlay on background image for text readability.
- **Responsive**: On mobile, reduce font sizes and padding. CTA stacks vertically if needed.

#### ScentFamilyQuickLinks (`components/home/ScentFamilyQuickLinks.tsx`)

- **Visual**: Horizontal row of pill-shaped buttons/chips.
- **Content**: Each chip represents a scent family — Floral, Woody, Fresh, Oriental, Citrus, Aquatic, Gourmand, Aromatic.
- **Behavior**: Clicking a chip navigates to `/shop?scentFamily=<value>`.
- **Styling**: Subtle background colors, hover effects, and optional icons for each scent family.
- **Responsive**: Horizontally scrollable on mobile with overflow.

#### FeaturedSection (`components/home/FeaturedSection.tsx`)

- **Two instances**: One for "New Arrivals", one for "Best Sellers".
- **Props**: `title: string`, `products: Product[]`, `badge?: string` (e.g., "New", "Best Seller").
- **Data fetching**: The HomePage fetches products from the API:
  - New Arrivals: `GET /api/products?sort=latest&limit=4`
  - Best Sellers: `GET /api/products?sort=popular&limit=4`
- **Layout**: Responsive grid — 4 columns on desktop, 2 on tablet, 1 on mobile.
- **Each item**: Renders a `ProductCard` component.
- **"View All" link**: Below the grid, linking to `/shop` with the appropriate sort.

### 8.2 Category / Listing (Shop) Page (`/shop`)

**Purpose**: Browse the full catalog with powerful filtering and sorting.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│                  HEADER / NAV                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  All Perfumes                    42 products     │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │              FILTER BAR                  │    │
│  │  [Category ▼] [Scent ▼] [Price Range]   │    │
│  │                          [Sort: Latest ▼]│    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │    │ │    │ │    │ │    │                      │
│  │ P1 │ │ P2 │ │ P3 │ │ P4 │                    │
│  │    │ │    │ │    │ │    │                      │
│  └────┘ └────┘ └────┘ └────┘                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │    │ │    │ │    │ │    │                      │
│  │ P5 │ │ P6 │ │ P7 │ │ P8 │                    │
│  │    │ │    │ │    │ │    │                      │
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                  │
│        [1] [2] [3] [4] [>]  (Pagination)         │
│                                                  │
├─────────────────────────────────────────────────┤
│                    FOOTER                        │
└─────────────────────────────────────────────────┘
```

**Components & Details:**

#### Page Header

- **Title**: "All Perfumes" (or dynamic: "Men's Perfumes" if category is pre-selected).
- **Product count**: e.g., "42 products found".
- **Breadcrumbs**: Home > Shop.

#### FilterBar (`components/shop/FilterBar.tsx`)

- **Category filter**: Dropdown or button group with options: "All", "Men", "Women", "Unisex".
- **Scent family filter**: Dropdown with multi-select or single-select for scent families.
- **Price range**: Two number inputs (Min / Max) or a dual-handle range slider.
- **Search input**: Text field for keyword search (by product name or brand). Pre-populated if the user navigated here via the header search.
- **Active filters display**: Below the filter bar, show pill badges for each active filter with an "×" to remove. Include a "Clear All" button.
- **Behavior**: Filters update the URL query params and trigger a new API request. This enables shareable filter URLs (e.g., `/shop?category=MEN&scentFamily=WOODY`).

#### SortDropdown (`components/shop/SortDropdown.tsx`)

- **Options**:
  - "Newest" (`sort=latest`) — default.
  - "Price: Low to High" (`sort=priceAsc`).
  - "Price: High to Low" (`sort=priceDesc`).
  - "Popularity" (`sort=popular`).
- **Behavior**: Updates URL query param and re-fetches.

#### ProductGrid (`components/shop/ProductGrid.tsx`)

- **Layout**: CSS Grid — 4 columns on large screens, 3 on medium, 2 on small, 1 on extra small.
- **Gap**: Consistent spacing between cards.
- **Loading state**: Show a skeleton/shimmer grid while fetching.
- **Empty state**: When no products match filters, display `EmptyState` component with message: "No perfumes match your filters" and a "Reset Filters" button.

#### ProductCard (`components/shop/ProductCard.tsx`)

- **Visual**:
  - Product image (fixed aspect ratio, object-fit cover).
  - Badge overlay (optional): "New" or "Best Seller" in top-left corner.
- **Content**:
  - Brand name (smaller, muted text).
  - Product name (bold).
  - Concentration badge (e.g., "EDP" in a small pill).
  - Volume (e.g., "100ml").
  - Price (prominent, formatted with currency).
- **Interaction**:
  - Entire card is clickable → navigates to `/products/:slug`.
  - Hover effect: subtle scale-up and shadow.
  - Optional "Add to Cart" button on hover (bottom of card).
- **Responsive**: Card adapts its layout at different breakpoints.

#### Pagination

- **Style**: Numbered page buttons with Previous/Next arrows.
- **Behavior**: Updates `page` query param. Scrolls to top of product grid on page change.
- **Info**: Shows "Page X of Y" or integrates this into the product count.

### 8.3 Product Detail Page (`/products/:slug`)

**Purpose**: Provide comprehensive fragrance information to help the user make a purchase decision.

**Layout (Desktop — two columns):**

```
┌─────────────────────────────────────────────────┐
│                  HEADER / NAV                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Home > Shop > Men > Bleu de Chanel              │
│                                                  │
│  ┌───────────────┐  ┌──────────────────────┐     │
│  │               │  │  CHANEL               │    │
│  │   PRODUCT     │  │  Bleu de Chanel       │    │
│  │   IMAGE       │  │  ─────────────────    │    │
│  │               │  │  EDP | Woody          │    │
│  │               │  │                       │    │
│  │               │  │  $150.00              │    │
│  │               │  │                       │    │
│  │               │  │  Volume: 100ml        │    │
│  │               │  │  ✓ In Stock           │    │
│  │               │  │                       │    │
│  │               │  │  ── Scent Notes ──    │    │
│  │               │  │  Top: Citrus, Mint    │    │
│  │               │  │  Heart: Cedar, Nutmeg │    │
│  │               │  │  Base: Sandalwood     │    │
│  │               │  │                       │    │
│  │               │  │  [  Add to Cart  ]    │    │
│  │               │  │  [Continue Shopping]  │    │
│  └───────────────┘  └──────────────────────┘     │
│                                                  │
│  ── Description ──                               │
│  A captivating woody aromatic fragrance that...  │
│                                                  │
│  ── You May Also Like ──                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │ R1 │ │ R2 │ │ R3 │ │ R4 │                    │
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                  │
├─────────────────────────────────────────────────┤
│                    FOOTER                        │
└─────────────────────────────────────────────────┘
```

**Components & Details:**

#### Breadcrumbs

- Format: Home > Shop > {Category} > {Product Name}.
- Each segment is a clickable link.
- E.g., Home > Shop > Men > Bleu de Chanel.

#### ProductGallery (`components/product/ProductGallery.tsx`)

- **Main image**: Large display of `imageUrl`. Maintains aspect ratio.
- **Thumbnails** (future): Below the main image, show thumbnail strip if multiple images exist. For MVP with single `imageUrl`, show only the main image.
- **Interaction**: Click to zoom (future) or lightbox overlay.
- **Responsive**: On mobile, image takes full width above the info panel.

#### ProductInfoPanel (`components/product/ProductInfoPanel.tsx`)

- **Brand**: Displayed in uppercase, smaller font, muted color.
- **Name**: Large, bold heading.
- **Concentration badge**: Pill badge showing "EDT", "EDP", etc.
- **Scent family**: Text label or badge (e.g., "Woody").
- **Price**: Large, prominent display with currency formatting (e.g., "$150.00").
- **Volume**: "100ml" or similar.
- **Availability**:
  - If `stock > 0`: Green "✓ In Stock" label.
  - If `stock === 0`: Red "Out of Stock" label. Disable "Add to Cart" button.
- **Scent Notes (ScentNotes component)**:
  - Displayed in a visual pyramid or grouped list:
    - **Top Notes**: Individual notes as pills/badges.
    - **Heart Notes**: Individual notes as pills/badges.
    - **Base Notes**: Individual notes as pills/badges.
- **Primary CTA**: "Add to Cart" button.
  - On click: adds product to the Zustand cart store, shows a confirmation toast or badge update.
  - Disabled if out of stock.
- **Secondary CTA**: "Continue Shopping" → navigates back to `/shop`.

#### Description Section

- Rendered below the two-column layout.
- Full `description` text (if available) in a readable paragraph format.
- If no description, this section is hidden.

#### RelatedProducts (`components/product/RelatedProducts.tsx`)

- **Title**: "You May Also Like".
- **Logic**: Fetch 4 products from the same category or scent family (excluding the current product).
  - API call: `GET /api/products?category={currentCategory}&limit=4` and filter out the current product.
- **Display**: Horizontal row of `ProductCard` components.
- **Responsive**: Horizontally scrollable on mobile.

#### Mobile Layout

- On screens < 768px:
  - Image takes full width.
  - Info panel stacks below image.
  - Consider a **sticky bottom bar** with the price and "Add to Cart" button that remains visible as the user scrolls.

### 8.4 Login / Register Page (`/auth`)

**Purpose**: Allow users to create an account, log in, or continue as a guest with minimal friction.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│                  HEADER / NAV                    │
├─────────────────────────────────────────────────┤
│                                                  │
│              ╔═══════════════════╗               │
│              ║                   ║               │
│              ║   [Login|Register]║  ← Tab toggle │
│              ║                   ║               │
│              ║   ┌─────────────┐ ║               │
│              ║   │ Email       │ ║               │
│              ║   └─────────────┘ ║               │
│              ║   ┌─────────────┐ ║               │
│              ║   │ Password    │ ║               │
│              ║   └─────────────┘ ║               │
│              ║                   ║               │
│              ║   [ Login ]       ║               │
│              ║                   ║               │
│              ║   ── or ──        ║               │
│              ║                   ║               │
│              ║  [Continue Guest] ║               │
│              ║                   ║               │
│              ╚═══════════════════╝               │
│                                                  │
├─────────────────────────────────────────────────┤
│                    FOOTER                        │
└─────────────────────────────────────────────────┘
```

**Components & Details:**

#### AuthPage (`routes/AuthPage.tsx`)

- **Layout**: Centered card on a subtle background.
- **Tab toggle**: Two tabs — "Login" and "Register" — that switch between forms.
- **Behavior**: Default tab is "Login". URL can include a `?tab=register` query param.

#### LoginForm (`components/auth/LoginForm.tsx`)

- **Fields**:
  - **Email**: Text input, type `email`, with validation.
  - **Password**: Text input, type `password`.
- **CTA**: "Login" button (full-width).
- **Validation**:
  - Client-side: Email format, password non-empty (using Zod `LoginSchema` from `shared`).
  - Show inline error messages below each field.
  - Show server-side error (e.g., "Invalid credentials") as a top-level alert.
- **Link**: "Don't have an account? Register" — switches to Register tab.
- **Behavior**:
  - On submit: `POST /api/auth/login`.
  - On success: Store JWT and user in auth store, redirect to Home (`/`).
  - On failure: Display error message.

#### RegisterForm (`components/auth/RegisterForm.tsx`)

- **Fields**:
  - **Name**: Text input.
  - **Email**: Text input, type `email`.
  - **Password**: Text input, type `password`.
  - **Confirm Password**: Text input, type `password`.
- **CTA**: "Create Account" button (full-width).
- **Validation**:
  - Client-side: All fields required, email format, password min 8 chars, passwords match (using `RegisterSchema` from `shared`).
  - Inline error messages.
  - Server error display (e.g., "Email already registered").
- **Link**: "Already have an account? Login" — switches to Login tab.
- **Behavior**:
  - On submit: `POST /api/auth/register`.
  - On success: Store JWT and user in auth store, redirect to Home (`/`).
  - On failure: Display error message.

#### GuestLoginCTA (`components/auth/GuestLoginCTA.tsx`)

- **Visual**: Separated from the login/register forms by a divider ("— or —").
- **Content**: "Continue as Guest" button with secondary styling.
- **Behavior**:
  - On click: Calls `useAuthStore.getState().setGuest()`.
  - Redirects to Home (`/`).
  - The user can browse freely. Cart data is stored in `localStorage`.
  - **Important**: Guest mode does NOT persist any user data server-side. The user has no account, no order history, and no server-side cart.

#### UX Best Practices for Auth Page

- **Minimal friction**: Only ask for essential fields. No CAPTCHA, no phone number, no address — those belong in checkout (future).
- **Guest option prominent**: The "Continue as Guest" button should be clearly visible, not hidden or de-emphasized. Forcing registration is a major conversion killer in e-commerce.
- **Password visibility toggle**: Add an eye icon to toggle password visibility.
- **Loading states**: Disable the form and show a spinner during API calls.
- **Auto-redirect**: If the user is already logged in and navigates to `/auth`, redirect them to Home.

---

## 9. Auth & Application Workflow

### 9.1 Application Flow Diagram

```
                            ┌────────────┐
                            │  App Load  │
                            └─────┬──────┘
                                  │
                        ┌─────────▼─────────┐
                        │ Check localStorage │
                        │ for auth token     │
                        └─────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │              │
              ┌─────▼─────┐ ┌────▼────┐  ┌─────▼─────┐
              │ Has Token  │ │Is Guest │  │ No Auth   │
              └─────┬──────┘ └────┬────┘  └─────┬─────┘
                    │             │              │
              ┌─────▼──────┐     │              │
              │ GET /auth  │     │              │
              │ /me        │     │              │
              └─────┬──────┘     │              │
                    │            │              │
              ┌─────▼──────┐    │              │
              │ Valid?     │    │              │
              │ Yes → Auth │    │              │
              │ No → Clear │    │              │
              └────────────┘    │              │
                    │            │              │
                    ▼            ▼              ▼
              ┌─────────────────────────────────────┐
              │           BROWSE FREELY              │
              │  Home → Shop → Product Detail        │
              │  (All pages accessible)              │
              └─────────────────────────────────────┘
```

### 9.2 Auth State Transitions

| Current State | Action | New State | Side Effects |
|--------------|--------|-----------|-------------|
| No Auth | Click "Login" + valid credentials | Authenticated | Store `{ user, token }` in Zustand + localStorage. Redirect to Home. |
| No Auth | Click "Register" + valid data | Authenticated | Create account, store `{ user, token }`. Redirect to Home. |
| No Auth | Click "Continue as Guest" | Guest | Set `isGuest: true` in store. Redirect to Home. |
| Authenticated | Click "Logout" | No Auth | Clear `{ user, token }` from store + localStorage. Redirect to Home. |
| Guest | Click "Login" or "Register" | Authenticated | Replace guest state with auth state. Cart data persists. |
| Authenticated | Token expires (401 from API) | No Auth | Auto-clear auth state via Axios interceptor. |

### 9.3 Protected vs Public Routes

| Route | Guest | Authenticated | Notes |
|-------|-------|--------------|-------|
| `/` (Home) | ✅ | ✅ | Fully public |
| `/shop` | ✅ | ✅ | Fully public |
| `/products/:slug` | ✅ | ✅ | Fully public |
| `/auth` | ✅ | 🔄 Redirect to `/` | If already logged in, redirect away |

In this MVP, **no frontend routes are protected**. All storefront pages are accessible to everyone. The auth system exists to support:
- Personalized header (show user name vs. "Login" link).
- Future features (persisted cart, order history, wishlist).

### 9.4 JWT Token Lifecycle

1. **Token creation**: Generated on login/register with 7-day expiration.
2. **Token storage**: Zustand `persist` middleware stores it in `localStorage` under the key `auth-storage`.
3. **Token usage**: Attached to every API request via Axios request interceptor (`Authorization: Bearer <token>`).
4. **Token refresh**: Not implemented in MVP. After 7 days, the user must re-login.
5. **Token invalidation**: On logout, the token is removed from the store. Since JWTs are stateless, the server cannot invalidate a specific token — it remains valid until expiration. For MVP, this is acceptable.

---

## 10. Implementation Steps (Chronological)

### Step 1: Initialize Repository and Monorepo Structure

**Goal**: Set up the project root, Git, and monorepo workspace configuration.

**Commands:**

```bash
# Navigate to the project directory
cd "/Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Bootcamp Exercise/Module 4 - AI-Powered SOftware Development/03 AI-Assisted UI UX Design for Software Development/parfume-marketplace"

# Initialize Git repository
git init

# Create root package.json with workspaces
npm init -y

# Create workspace directories
mkdir -p shared/src/{schemas,types}
mkdir -p server/src/{routes,controllers,services,middlewares,lib,types}
mkdir -p server/prisma
mkdir -p client/src/{routes,components/{layout,home,shop,product,auth,ui},hooks,stores,lib,types}
```

**Files to create:**

1. **`.gitignore`** (root):
   ```
   node_modules/
   dist/
   .env
   .env.local
   *.log
   .DS_Store
   ```

2. **`package.json`** (root) — Edit to include workspaces:
   ```json
   {
     "name": "parfume-marketplace",
     "version": "1.0.0",
     "private": true,
     "workspaces": ["shared", "server", "client"],
     "scripts": {
       "dev:server": "npm run dev --workspace=server",
       "dev:client": "npm run dev --workspace=client",
       "build:shared": "npm run build --workspace=shared",
       "db:migrate": "npm run db:migrate --workspace=server",
       "db:seed": "npm run db:seed --workspace=server",
       "db:generate": "npm run db:generate --workspace=server"
     }
   }
   ```

3. **`.env.example`** (root):
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/parfume_marketplace?schema=public"

   # Server
   PORT=3000
   JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars-long"
   CLIENT_URL="http://localhost:5173"

   # Client
   VITE_API_BASE_URL="http://localhost:3000/api"
   ```

4. **`README.md`** (root): Basic project description and setup instructions.

**Rationale**: npm workspaces allow the `shared` package to be linked locally without publishing. The root `package.json` acts as the workspace orchestrator.

---

### Step 2: Setup Shared Package (`/shared`)

**Goal**: Create the shared package with Zod schemas and TypeScript types used by both server and client.

**Commands:**

```bash
# Initialize shared package
cd shared
npm init -y
# Edit package.json to set name to "shared" and main to "src/index.ts"
```

**Files to create:**

1. **`shared/package.json`**:
   ```json
   {
     "name": "shared",
     "version": "1.0.0",
     "private": true,
     "main": "src/index.ts",
     "types": "src/index.ts",
     "dependencies": {
       "zod": "^3.23.8"
     }
   }
   ```

2. **`shared/tsconfig.json`**:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "declaration": true,
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src"]
   }
   ```

3. **`shared/src/index.ts`**: Barrel export for all schemas and types.
   ```typescript
   export * from "./schemas/auth.schema";
   export * from "./schemas/product.schema";
   export * from "./types/auth.types";
   export * from "./types/product.types";
   ```

4. **`shared/src/schemas/auth.schema.ts`**: Zod schemas for `RegisterSchema` and `LoginSchema` (as defined in Section 4.5).

5. **`shared/src/schemas/product.schema.ts`**: Zod schemas for `ProductCreateSchema`, `ProductQuerySchema`, and enums (as defined in Section 4.5).

6. **`shared/src/types/auth.types.ts`**:
   ```typescript
   import { z } from "zod";
   import { RegisterSchema, LoginSchema } from "../schemas/auth.schema";

   export type RegisterInput = z.infer<typeof RegisterSchema>;
   export type LoginInput = z.infer<typeof LoginSchema>;

   export interface AuthUser {
     id: string;
     name: string;
     email: string;
   }

   export interface AuthResponse {
     user: AuthUser;
     token: string;
   }
   ```

7. **`shared/src/types/product.types.ts`**:
   ```typescript
   import { z } from "zod";
   import { ProductCreateSchema, ProductQuerySchema } from "../schemas/product.schema";

   export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
   export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;

   export interface Product {
     id: string;
     name: string;
     brand: string;
     slug: string;
     category: "MEN" | "WOMEN" | "UNISEX";
     scentFamily: string;
     notesTop: string;
     notesHeart: string;
     notesBase: string;
     concentration: "EDT" | "EDP" | "PARFUM" | "EDC";
     price: number;
     volumeMl: number;
     stock: number;
     status: "ACTIVE" | "INACTIVE";
     imageUrl: string;
     description: string | null;
     createdAt: string;
     updatedAt: string;
   }

   export interface PaginatedResponse<T> {
     products: T[];
     pagination: {
       page: number;
       limit: number;
       total: number;
       totalPages: number;
     };
   }
   ```

---

### Step 3: Setup Backend (`/server`)

**Goal**: Initialize the Express backend with TypeScript, install all dependencies, and configure the project.

**Commands:**

```bash
cd server
npm init -y
```

**Install dependencies:**

```bash
# Production dependencies
npm install express cors dotenv bcrypt jsonwebtoken zod pg @prisma/client @prisma/adapter-pg shared

# Dev dependencies
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/pg prisma tsx
```

> **Note**: `shared` is resolved via npm workspaces — no special install needed if running `npm install` from the root.

**Files to create:**

1. **`server/package.json`** (edit after init):
   ```json
   {
     "name": "server",
     "version": "1.0.0",
     "private": true,
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js",
       "db:migrate": "npx prisma migrate dev",
       "db:generate": "npx prisma generate",
       "db:seed": "npx prisma db seed",
       "db:studio": "npx prisma studio"
     },
     "prisma": {
       "seed": "tsx prisma/seed.ts"
     },
     "dependencies": {
       "@prisma/adapter-pg": "^7.8.0",
       "@prisma/client": "^7.8.0",
       "bcrypt": "^5.1.1",
       "cors": "^2.8.5",
       "dotenv": "^16.4.5",
       "express": "^4.19.2",
       "jsonwebtoken": "^9.0.2",
       "pg": "^8.21.0",
       "shared": "*",
       "zod": "^3.23.8"
     },
     "devDependencies": {
       "@types/bcrypt": "^5.0.2",
       "@types/cors": "^2.8.17",
       "@types/express": "^4.17.21",
       "@types/jsonwebtoken": "^9.0.6",
       "@types/node": "^25.9.1",
       "@types/pg": "^8.20.0",
       "prisma": "^7.8.0",
       "tsx": "^4.11.0",
       "typescript": "^5.4.5"
     }
   }
   ```

2. **`server/tsconfig.json`**:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

3. **`server/.env`** (copy from `.env.example` and fill in real values):
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/parfume_marketplace?schema=public"
   PORT=3000
   JWT_SECRET="change-this-to-a-very-long-random-secret-string-at-least-32-characters"
   CLIENT_URL="http://localhost:5173"
   ```

**Create core server files:**

4. **`server/src/index.ts`**: Import `dotenv/config`, import `app` from `./app`, listen on `PORT`.

5. **`server/src/app.ts`**: Create Express app, apply `express.json()`, `cors()`, mount routes, apply `errorHandler`.

6. **`server/src/lib/prisma.ts`**: Create and export a singleton Prisma client instance.

7. **`server/src/lib/hash.ts`**: Export `hashPassword()` and `comparePassword()` functions using `bcrypt`.

8. **`server/src/middlewares/errorHandler.ts`**: Global error handler (as defined in Section 5.6).

9. **`server/src/middlewares/validateRequest.ts`**: Zod validation middleware (as defined in Section 5.5).

10. **`server/src/middlewares/authGuard.ts`**: JWT verification middleware that:
    - Extracts token from `Authorization: Bearer <token>` header.
    - Verifies with `jwt.verify(token, JWT_SECRET)`.
    - Attaches decoded payload to `req.user`.
    - Returns 401 if missing or invalid.

11. **`server/src/types/express.d.ts`**: Augment Express `Request` type to include `user` property:
    ```typescript
    declare namespace Express {
      interface Request {
        user?: { id: string; email: string };
      }
    }
    ```

12. **`server/src/routes/index.ts`**: Aggregate and export all route files.

---

### Step 4: Configure Prisma & PostgreSQL

**Goal**: Set up the database schema, run migrations, and verify the database connection.

**Prerequisites**: PostgreSQL must be installed and running locally. A database named `parfume_marketplace` must exist.

#### Step 4a: Create the PostgreSQL Database

**Using DBeaver (step-by-step):**

1. **Open DBeaver** and create a new connection:
   - Click the "New Database Connection" button (plug icon) or go to `Database > New Connection`.
   - Select "PostgreSQL" from the list.
   - Click "Next".

2. **Configure connection settings**:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `postgres` (connect to the default database first)
   - **Username**: `postgres` (or your PostgreSQL username)
   - **Password**: Your PostgreSQL password
   - Click "Test Connection" to verify. If prompted to download a driver, click "Download".
   - Click "Finish".

3. **Create the `parfume_marketplace` database**:
   - In the Database Navigator panel, expand your connection.
   - Right-click on "Databases" → "Create New Database".
   - Enter the name: `parfume_marketplace`.
   - Set the Owner to `postgres` (or your user).
   - Set Encoding to `UTF8`.
   - Click "OK".

4. **Verify**: Refresh the connection. You should see `parfume_marketplace` listed under Databases.

**Using the terminal (alternative to DBeaver):**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE parfume_marketplace;

# Verify
\l

# Exit
\q
```

#### Step 4b: Initialize Prisma

```bash
cd server

# Initialize Prisma (creates prisma/ directory with schema.prisma)
npx prisma init
```

This creates:
- `server/prisma/schema.prisma` (template — replace with the schema from Section 4.4)
- Adds `DATABASE_URL` placeholder to `.env` if not already present

#### Step 4c: Define the Schema

Replace the contents of `server/prisma/schema.prisma` with the full schema from **Section 4.4** (includes `Product` and `User` models with all enums).

#### Step 4d: Run Initial Migration

```bash
cd server

# Run migration (creates tables in PostgreSQL)
npx prisma migrate dev --name init
```

**What this does:**
1. Compares the schema to the current database state.
2. Generates a SQL migration file in `prisma/migrations/`.
3. Applies the migration to the database (creates `products` and `users` tables with all columns and constraints).
4. Generates the Prisma client (`@prisma/client`).

**Verify in DBeaver:**
1. Refresh your `parfume_marketplace` database connection.
2. Expand `Schemas > public > Tables`.
3. You should see `products`, `users`, and `_prisma_migrations` tables.
4. Right-click a table and select "View Data" to confirm the structure.

#### Step 4e: Generate Prisma Client (if needed separately)

```bash
npx prisma generate
```

---

### Step 5: Implement Auth API

**Goal**: Implement user registration and login endpoints with JWT authentication.

**Files to create/update:**

1. **`server/src/services/auth.service.ts`**:
   - `registerUser(data: RegisterInput)`:
     1. Check if email exists → throw 409 error if so.
     2. Hash password with `hashPassword()`.
     3. Create user via `prisma.user.create()`.
     4. Generate JWT with user payload.
     5. Return `{ user: { id, name, email }, token }`.
   - `loginUser(data: LoginInput)`:
     1. Find user by email → throw 401 if not found.
     2. Compare password → throw 401 if mismatch.
     3. Generate JWT.
     4. Return `{ user: { id, name, email }, token }`.
   - `getUserById(id: string)`:
     1. Find user by ID, select only `id`, `name`, `email`.
     2. Return user or throw 404.

2. **`server/src/controllers/auth.controller.ts`**:
   - `register`: Extract validated body, call `authService.registerUser()`, respond with 201.
   - `login`: Extract validated body, call `authService.loginUser()`, respond with 200.
   - `getMe`: Extract `req.user.id`, call `authService.getUserById()`, respond with 200.
   - All wrapped in try-catch, passing errors to `next()`.

3. **`server/src/routes/auth.routes.ts`**:
   ```typescript
   import { Router } from "express";
   import { register, login, getMe } from "../controllers/auth.controller";
   import { validateRequest } from "../middlewares/validateRequest";
   import { authGuard } from "../middlewares/authGuard";
   import { RegisterSchema, LoginSchema } from "shared";

   const router = Router();

   router.post("/register", validateRequest(RegisterSchema), register);
   router.post("/login", validateRequest(LoginSchema), login);
   router.get("/me", authGuard, getMe);

   export default router;
   ```

4. **Mount in `server/src/routes/index.ts`** and wire into `app.ts`:
   ```typescript
   // routes/index.ts
   import { Router } from "express";
   import authRoutes from "./auth.routes";
   import productRoutes from "./products.routes";

   const router = Router();
   router.use("/auth", authRoutes);
   router.use("/products", productRoutes);

   export default router;
   ```

   ```typescript
   // app.ts
   import routes from "./routes";
   app.use("/api", routes);
   ```

**Manual testing:**

```bash
# Start the server
cd server
npm run dev

# Test registration (using curl or Postman/Insomnia)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","confirmPassword":"password123"}'

# Expected response: 201 with { success: true, data: { user: {...}, token: "..." } }

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected response: 200 with { success: true, data: { user: {...}, token: "..." } }

# Test /me (replace <token> with the JWT from login/register response)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Expected response: 200 with { success: true, data: { user: {...} } }
```

---

### Step 6: Implement Products API

**Goal**: Build product listing and detail endpoints with filtering, sorting, and pagination.

**Files to create/update:**

1. **`server/src/services/products.service.ts`**:
   - `listProducts(query: ProductQueryInput)`:
     1. Build Prisma `where` clause dynamically from query params (always include `status: "ACTIVE"`).
     2. Build `orderBy` from `sort` param.
     3. Calculate `skip` and `take` from `page` and `limit`.
     4. Execute `prisma.product.findMany()` with `where`, `orderBy`, `skip`, `take`.
     5. Execute `prisma.product.count()` with same `where` for total count.
     6. Return `{ products, pagination: { page, limit, total, totalPages } }`.
   - `getProductBySlug(slug: string)`:
     1. `prisma.product.findUnique({ where: { slug } })`.
     2. Throw 404 if not found.
     3. Return product.
   - `createProduct(data: ProductCreateInput)`:
     1. Generate slug from `name + concentration + volumeMl` (e.g., "bleu-de-chanel-edp-100ml").
     2. `prisma.product.create({ data: { ...data, slug } })`.
     3. Return created product.

2. **`server/src/controllers/products.controller.ts`**:
   - `listProducts`: Extract validated query, call service, respond with 200.
   - `getProductBySlug`: Extract `req.params.slug`, call service, respond with 200.
   - `createProduct`: Extract validated body, call service, respond with 201.

3. **`server/src/routes/products.routes.ts`**:
   ```typescript
   import { Router } from "express";
   import { listProducts, getProductBySlug, createProduct } from "../controllers/products.controller";
   import { validateRequest } from "../middlewares/validateRequest";
   import { ProductQuerySchema, ProductCreateSchema } from "shared";

   const router = Router();

   router.get("/", validateRequest(ProductQuerySchema, "query"), listProducts);
   router.get("/:slug", getProductBySlug);
   router.post("/", validateRequest(ProductCreateSchema), createProduct); // Internal/seed use

   export default router;
   ```

**Manual testing:**

```bash
# List all products (after seeding — see Step 6a)
curl "http://localhost:3000/api/products"

# List with filters
curl "http://localhost:3000/api/products?category=MEN&scentFamily=WOODY&sort=priceAsc&page=1&limit=8"

# Get product by slug
curl "http://localhost:3000/api/products/bleu-de-chanel-edp-100ml"
```

#### Step 6a: Seed Sample Data

**Create `server/prisma/seed.ts`:**

This file defines 15–20 sample perfume products with realistic data. Example structure:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    slug: "bleu-de-chanel-edp-100ml",
    category: "MEN" as const,
    scentFamily: "WOODY" as const,
    notesTop: "Citrus, Mint, Pink Pepper",
    notesHeart: "Ginger, Nutmeg, Jasmine, Iso E Super",
    notesBase: "Sandalwood, Cedar, Vetiver, Labdanum",
    concentration: "EDP" as const,
    price: 150.00,
    volumeMl: 100,
    stock: 25,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/400x500/1a1a2e/e0e0e0?text=Bleu+de+Chanel",
    description: "A captivating and remarkably versatile woody aromatic fragrance..."
  },
  // ... 14-19 more products
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  // Create test user
  const bcrypt = await import("bcrypt");
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      passwordHash,
    },
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run the seed:**

```bash
cd server
npx prisma db seed
```

**Verify in DBeaver:**
1. Open your connection to `parfume_marketplace`.
2. Navigate to `Schemas > public > Tables > products`.
3. Right-click → "View Data" → "All Rows".
4. Verify that 15–20 products appear with correct data.
5. Also verify the `users` table has the test user.

---

### Step 7: Setup Frontend (`/client`)

**Goal**: Initialize the Vite React TypeScript app, configure Tailwind CSS v4, and set up routing.

**Commands:**

```bash
# From the project root
cd client

# Initialize Vite React TypeScript project
npx -y create-vite@latest ./ -- --template react-ts
```

> **Note**: The `./` tells Vite to scaffold in the current directory. The `--template react-ts` flag selects the React + TypeScript template.

**Install dependencies:**

```bash
# Production dependencies
npm install react-router-dom axios zustand tailwindcss @tailwindcss/vite lucide-react clsx tailwind-merge zod shared

# Dev dependencies (most already installed by Vite template)
npm install -D @types/node
```

**Configure Tailwind CSS v4:**

Edit `client/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Edit `client/src/index.css` (replace contents):

```css
/* See Section 7.7 for the complete @theme configuration.
   The full index.css contents are defined in the Visual Design System section.
   Copy the complete block from Section 7.7 into client/src/index.css. */
```

> **Tailwind v4 note**: No `tailwind.config.ts` or `postcss.config.ts` files are needed. The `@tailwindcss/vite` plugin handles everything. Theme customization is done via the `@theme` directive directly in CSS.

**Create core frontend files:**

1. **`client/src/main.tsx`**: Standard React DOM render with `<App />`.
2. **`client/src/App.tsx`**: Router configuration (as defined in Section 6.1).
3. **`client/src/lib/cn.ts`**: Class name merge utility (as defined in Section 6.6).
4. **`client/src/lib/apiClient.ts`**: Axios instance with interceptors (as defined in Section 6.4).
5. **`client/src/lib/routes.ts`**: API route constants (as defined in Section 6.4).
6. **`client/src/stores/authStore.ts`**: Zustand auth store (as defined in Section 6.3).
7. **`client/src/stores/cartStore.ts`**: Zustand cart store (as defined in Section 6.3).

**Verify the setup:**

```bash
cd client
npm run dev
```

Open `http://localhost:5173` in the browser. You should see the Vite React default page with Tailwind styles working.

---

### Step 8: Implement Layout Components

**Goal**: Build the shared Header, Footer, and Layout wrapper.

**Files to create:**

1. **`client/src/components/layout/Layout.tsx`**:
   - Renders `<Header />`, `<Outlet />` (from React Router), and `<Footer />`.
   - Wraps content in a flex column layout with min-height `100vh`.

2. **`client/src/components/layout/Header.tsx`**:
   - Fixed/sticky top navigation bar.
   - Left: "PARFUME" logo (text, links to `/`).
   - Center: Navigation links — "Home" (`/`), "Shop" (`/shop`).
   - Right side items:
     - Search input with `Search` icon from Lucide.
     - Cart icon (`ShoppingBag` from Lucide) with item count badge from cart store.
     - Account: If logged in, show user name + dropdown (Logout). If guest/no auth, show "Login" link (`/auth`).
   - Responsive: On mobile, collapse nav into a hamburger menu (`Menu` icon).

3. **`client/src/components/layout/Footer.tsx`**:
   - Three-column grid on desktop, stacked on mobile.
   - Column 1: Brand name + tagline.
   - Column 2: Quick links (About, Help, Contact — placeholder anchors).
   - Column 3: Social icons (placeholder).
   - Bottom bar: Copyright notice.

---

### Step 9: Implement Home Page

**Goal**: Build the landing page with hero, scent family links, and featured product sections.

**Files to create:**

1. **`client/src/routes/HomePage.tsx`**:
   - On mount, fetch "New Arrivals" (`?sort=latest&limit=4`) and "Best Sellers" (`?sort=popular&limit=4`) from the API.
   - Render: `<HeroSection />`, `<ScentFamilyQuickLinks />`, `<FeaturedSection title="New Arrivals" />`, `<FeaturedSection title="Best Sellers" />`.

2. **`client/src/components/home/HeroSection.tsx`**:
   - Full-width section with gradient or image background.
   - Headline, subtext, "Shop Now" button linking to `/shop`.

3. **`client/src/components/home/ScentFamilyQuickLinks.tsx`**:
   - Row of clickable chips for each scent family.
   - Each chip links to `/shop?scentFamily=<value>`.

4. **`client/src/components/home/FeaturedSection.tsx`**:
   - Props: `title`, `products`, `badge` (optional).
   - Renders a grid of `ProductCard` components.
   - "View All" link at the bottom.

5. **`client/src/components/shop/ProductCard.tsx`** (shared between Home and Shop pages):
   - Displays product image, brand, name, concentration badge, price.
   - Clickable → navigates to `/products/:slug`.
   - Hover effect with scale transform.

---

### Step 10: Implement Shop Page

**Goal**: Build the full product listing page with filters, sorting, and pagination.

**Files to create:**

1. **`client/src/routes/ShopPage.tsx`**:
   - Reads initial filter/sort/page values from URL search params.
   - Fetches products from API with current filters.
   - Manages filter state and syncs with URL params (for shareable URLs).
   - Renders: page title + count, `<FilterBar />`, `<SortDropdown />`, `<ProductGrid />`, pagination controls.

2. **`client/src/components/shop/FilterBar.tsx`**:
   - Category buttons (All / Men / Women / Unisex).
   - Scent family dropdown.
   - Price range inputs (min/max).
   - Active filter pills with clear buttons.
   - "Clear All" button.

3. **`client/src/components/shop/SortDropdown.tsx`**:
   - Dropdown select with options: Newest, Price Low→High, Price High→Low, Popularity.

4. **`client/src/components/shop/ProductGrid.tsx`**:
   - Responsive CSS grid of `ProductCard` components.
   - Loading skeleton state.
   - Empty state component when no results.

5. **Pagination component** (can be inline in `ShopPage.tsx` or a separate `Pagination.tsx`):
   - Page number buttons, Previous/Next.
   - "Page X of Y" label.

---

### Step 11: Implement Product Detail Page

**Goal**: Build the product detail view with full fragrance information.

**Files to create:**

1. **`client/src/routes/ProductDetailPage.tsx`**:
   - Extract `slug` from URL params via `useParams()`.
   - Fetch product from `GET /api/products/:slug`.
   - Loading and error states.
   - Render: breadcrumbs, two-column layout with `<ProductGallery />` and `<ProductInfoPanel />`, description section, `<RelatedProducts />`.

2. **`client/src/components/product/ProductGallery.tsx`**:
   - Displays the main product image.
   - Responsive sizing.

3. **`client/src/components/product/ProductInfoPanel.tsx`**:
   - Brand name, product name, concentration badge, scent family label.
   - Price display.
   - Volume info.
   - Stock availability indicator.
   - `<ScentNotes />` component.
   - "Add to Cart" button (calls `cartStore.addItem()`).
   - "Continue Shopping" link → `/shop`.

4. **`client/src/components/product/ScentNotes.tsx`**:
   - Visual display of Top, Heart, and Base notes.
   - Notes displayed as individual pill badges grouped by layer.

5. **`client/src/components/product/RelatedProducts.tsx`**:
   - Fetches 4 products from the same category (excluding current product).
   - Horizontal row of `ProductCard` components.

---

### Step 12: Implement Auth Page

**Goal**: Build login, registration, and guest access functionality.

**Files to create:**

1. **`client/src/routes/AuthPage.tsx`**:
   - Centered card layout.
   - Tab toggle between "Login" and "Register".
   - Reads `?tab=register` from URL to set initial tab.
   - If user is already authenticated, redirect to `/`.

2. **`client/src/components/auth/LoginForm.tsx`**:
   - Email and password fields.
   - Client-side validation using `LoginSchema` from `shared`.
   - Submit handler: calls API, updates auth store, redirects on success.
   - Error display for invalid credentials.
   - "Don't have an account? Register" link.

3. **`client/src/components/auth/RegisterForm.tsx`**:
   - Name, email, password, confirm password fields.
   - Client-side validation using `RegisterSchema` from `shared`.
   - Submit handler: calls API, updates auth store, redirects on success.
   - Error display.
   - "Already have an account? Login" link.

4. **`client/src/components/auth/GuestLoginCTA.tsx`**:
   - Divider ("— or —").
   - "Continue as Guest" button.
   - On click: sets guest flag in auth store, redirects to `/`.

5. **`client/src/hooks/useAuth.ts`**:
   - Wraps `authStore` actions with API calls.
   - `login(email, password)`: POST to `/api/auth/login`, update store.
   - `register(name, email, password, confirmPassword)`: POST to `/api/auth/register`, update store.
   - `logout()`: Clear store.
   - `continueAsGuest()`: Set guest flag.
   - Returns: `{ user, isAuthenticated, isGuest, login, register, logout, continueAsGuest, isLoading, error }`.

---

### Step 13: Implement Shared UI Components

**Goal**: Build reusable UI primitives used across all pages.

**Files to create:**

1. **`client/src/components/ui/Button.tsx`**:
   - Props: `variant` ("primary" | "secondary" | "outline" | "ghost"), `size` ("sm" | "md" | "lg"), `isLoading`, standard button props.
   - Renders a styled `<button>` with appropriate Tailwind classes.
   - Loading state shows spinner and disables the button.

2. **`client/src/components/ui/Input.tsx`**:
   - Props: `label`, `error`, `icon` (optional), standard input props.
   - Renders a labeled `<input>` with error message display.
   - Styling: bordered input with focus ring, error state with red border.

3. **`client/src/components/ui/Badge.tsx`**:
   - Props: `variant` ("new" | "bestseller" | "concentration"), `children`.
   - Small pill-shaped label for product tags.

4. **`client/src/components/ui/Spinner.tsx`**:
   - Animated loading spinner (CSS animation).
   - Props: `size` ("sm" | "md" | "lg").

5. **`client/src/components/ui/EmptyState.tsx`**:
   - Props: `title`, `description`, `action` (optional button).
   - Centered placeholder for empty lists/results.

---

### Step 14: Integrate Auth State and Cart

**Goal**: Wire up the auth and cart stores with the UI.

**Tasks:**

1. **Header integration**:
   - Read `useAuthStore()` to show user name or "Login" link.
   - Read `useCartStore()` to show cart item count badge.
   - Implement logout functionality.

2. **Cart interaction**:
   - "Add to Cart" on `ProductInfoPanel` and optional quick-add on `ProductCard`.
   - Show confirmation feedback (e.g., toast notification or badge pulse animation).
   - Cart drawer/overlay (optional in MVP — can be a simple item count in the header).

3. **Auth redirect**:
   - After successful login/register, redirect to the previous page or Home.
   - If already logged in, redirect away from `/auth`.

4. **Guest mode**:
   - When guest clicks "Continue as Guest", set `isGuest: true` in auth store.
   - Cart functions the same for guests and authenticated users (both use localStorage via Zustand persist).
   - Header shows "Guest" or simply the login/register link.

---

### Step 15: Polish and Responsive Design

**Goal**: Refine the UI, ensure responsiveness, and add micro-interactions.

**Tasks:**

1. **Responsive testing**: Test all pages at breakpoints:
   - Mobile: 375px, 414px
   - Tablet: 768px
   - Desktop: 1024px, 1440px

2. **Mobile navigation**: Implement hamburger menu for the header on small screens.

3. **Loading states**: Add skeleton loaders for:
   - Product grid on Shop page.
   - Product detail page while fetching.
   - Featured sections on Home page.

4. **Hover & transition effects**:
   - Product cards: scale + shadow on hover.
   - Buttons: color transitions.
   - Navigation links: underline animations.

5. **SEO basics**:
   - Set `<title>` for each page via `useEffect` or a custom hook.
   - Add meta descriptions.
   - Use semantic HTML (`<main>`, `<nav>`, `<article>`, `<section>`).
   - Single `<h1>` per page.

6. **Accessibility**:
   - Proper `aria-label` attributes.
   - Keyboard navigation for all interactive elements.
   - Color contrast compliance.

---

### Step 16: Manual QA and Bug Fixes

**Goal**: Test all user flows end-to-end and fix discovered issues.

**Test flows:**

1. **Guest browsing flow**:
   - Open Home → Click "Shop Now" → View Shop page → Apply filters → Click product → View detail → Add to cart → Verify cart count in header → Continue shopping.

2. **Auth flow**:
   - Navigate to `/auth` → Register with valid data → Verify redirect to Home → Verify user name in header → Logout → Verify "Login" link appears → Login with registered credentials → Verify auth state.

3. **Guest access flow**:
   - Navigate to `/auth` → Click "Continue as Guest" → Verify redirect to Home → Browse Shop → Add items to cart → Verify cart persists on page refresh (localStorage).

4. **Filter flow**:
   - Navigate to `/shop` → Apply category filter (Men) → Verify results update → Apply scent family filter (Woody) → Verify combined filtering → Apply price range → Sort by price low to high → Verify sort order → Clear all filters → Verify all products shown.

5. **Edge cases**:
   - Search for a non-existent product → Verify empty state.
   - Navigate to a non-existent product slug → Verify 404 handling.
   - Submit login with wrong password → Verify error message.
   - Submit register with existing email → Verify error message.
   - Submit register with mismatched passwords → Verify validation error.

---

## 11. Testing Strategy

### 11.1 Manual Testing (MVP Priority)

For the MVP, primary testing is manual, focusing on the core user flows described in Step 16.

**Backend API Testing:**

| Test Case | Method | Expected Result |
|-----------|--------|-----------------|
| Register with valid data | `POST /api/auth/register` | 201, returns user + token |
| Register with existing email | `POST /api/auth/register` | 409, "Email already registered" |
| Register with short password | `POST /api/auth/register` | 400, validation error |
| Login with valid credentials | `POST /api/auth/login` | 200, returns user + token |
| Login with wrong password | `POST /api/auth/login` | 401, "Invalid credentials" |
| Login with non-existent email | `POST /api/auth/login` | 401, "Invalid credentials" |
| Get /me with valid token | `GET /api/auth/me` | 200, returns user |
| Get /me without token | `GET /api/auth/me` | 401, "Unauthorized" |
| List products (no filters) | `GET /api/products` | 200, paginated list |
| List with category filter | `GET /api/products?category=MEN` | 200, only MEN products |
| List with price range | `GET /api/products?minPrice=50&maxPrice=200` | 200, filtered results |
| List with sort | `GET /api/products?sort=priceAsc` | 200, sorted by price ascending |
| List with pagination | `GET /api/products?page=2&limit=4` | 200, second page of results |
| List with combined filters | `GET /api/products?category=WOMEN&scentFamily=FLORAL&sort=latest` | 200, combined filter results |
| Get product by slug | `GET /api/products/bleu-de-chanel-edp-100ml` | 200, full product data |
| Get product with invalid slug | `GET /api/products/nonexistent` | 404, "Product not found" |

**Tools for manual API testing:**
- **curl**: Command-line HTTP client (examples provided in Step 5 and Step 6).
- **Postman** or **Insomnia**: GUI-based API testing tools. Import the endpoint collection.
- **Prisma Studio**: `npx prisma studio` opens a web UI to inspect database records directly.

**Frontend Testing:**

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Home page loads | Navigate to `/` | Hero, scent links, featured products visible |
| Featured products display | Navigate to `/` | New Arrivals and Best Sellers sections show products from API |
| Scent family navigation | Click "Woody" chip on Home | Redirects to `/shop?scentFamily=WOODY`, filtered results shown |
| Shop page filters | Apply Men + Floral filters | Product grid updates with matching products |
| Sort works | Select "Price: Low to High" | Products reorder by ascending price |
| Empty state | Apply impossible filter combination | "No perfumes match your filters" message with reset button |
| Product detail loads | Click any product card | Full product info displayed (brand, name, notes, price) |
| Add to cart | Click "Add to Cart" on detail page | Cart count in header increments |
| Cart persists | Add item, refresh page | Cart count still shows in header (localStorage persistence) |
| Login form validation | Submit empty login form | Inline error messages appear |
| Login success | Submit valid credentials | Redirect to Home, user name in header |
| Register validation | Submit with mismatched passwords | "Passwords do not match" error |
| Guest access | Click "Continue as Guest" | Redirect to Home, can browse freely |
| Responsive layout | Resize browser to mobile width | Header collapses, grids adapt, content stacks vertically |

### 11.2 Automated Testing (Future)

Automated testing should be added after the MVP is validated:

**Backend (Vitest):**
- Unit tests for services (`auth.service.ts`, `products.service.ts`).
- Integration tests for API endpoints using `supertest`.
- Test database seeded with fixtures before each test suite.

**Frontend (Vitest + React Testing Library):**
- Component unit tests for `ProductCard`, `FilterBar`, `LoginForm`, etc.
- Integration tests for page-level components (mocking API calls with `msw`).
- Snapshot tests for UI consistency.

**E2E (Playwright or Cypress):**
- Full user flow tests (guest browsing, auth flow, cart operations).
- Cross-browser testing.

**Setup commands** (for future implementation):

```bash
# Backend
cd server
npm install -D vitest supertest @types/supertest

# Frontend
cd client
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

---

## 12. Environment & Configuration

### 12.1 Environment Variables

The application uses environment variables for configuration. Variables are loaded via `dotenv` (server) and Vite's built-in env handling (client).

**Server environment variables (`server/.env`):**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/parfume_marketplace?schema=public` | ✅ Yes |
| `PORT` | Server port | `3000` | No (defaults to 3000) |
| `JWT_SECRET` | Secret for JWT signing | `my-super-secret-key-at-least-32-characters-long` | ✅ Yes |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` | No (defaults to `http://localhost:5173`) |

**Client environment variables (set in `client/.env` or root `.env`):**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` | No (defaults to `http://localhost:3000/api`) |

> **Vite env convention**: Client-side environment variables must be prefixed with `VITE_` to be exposed to the browser. Access them via `import.meta.env.VITE_API_BASE_URL`.

### 12.2 `.env.example` File (Root)

```env
# =======================================
# Marketplace for Parfume - Environment
# =======================================

# --- Database ---
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://postgres:password@localhost:5432/parfume_marketplace?schema=public"

# --- Server ---
# Port the Express server listens on
PORT=3000

# JWT secret key for authentication (minimum 32 characters)
# Generate a secure random string for production
JWT_SECRET="change-this-to-a-very-long-random-secret-string-at-least-32-characters"

# Allowed CORS origin (frontend URL)
CLIENT_URL="http://localhost:5173"

# --- Client ---
# API base URL for the frontend to call
VITE_API_BASE_URL="http://localhost:3000/api"
```

### 12.3 Local Development Setup Checklist

Before running the application locally, ensure:

1. **Node.js** ≥ 20 LTS is installed: `node --version`
2. **npm** ≥ 10 is installed: `npm --version`
3. **PostgreSQL** ≥ 15 is installed and running:
   - macOS: `brew services start postgresql@15` (if installed via Homebrew)
   - Verify: `psql -U postgres -c "SELECT version();"`
4. **Database created**: `parfume_marketplace` database exists (see Step 4a).
5. **`.env` file configured**: Copy `.env.example` to `server/.env` and `client/.env`, fill in real values.
6. **Dependencies installed**: `npm install` from the root (installs all workspaces).
7. **Migrations run**: `npm run db:migrate` from the root.
8. **Seed data loaded**: `npm run db:seed` from the root.

### 12.4 Running the Application

```bash
# Terminal 1: Start the backend
npm run dev:server
# Server starts on http://localhost:3000

# Terminal 2: Start the frontend
npm run dev:client
# Client starts on http://localhost:5173

# Optional: Open Prisma Studio (database GUI)
cd server && npx prisma studio
# Opens on http://localhost:5555
```

---

## 13. Future Enhancements

The following features are **not included in the MVP** but are natural next steps for the marketplace:

### 13.1 Short-Term (Next Sprint)

| Feature | Description |
|---------|-------------|
| **Cart Page** | Dedicated cart page with item list, quantity adjustment, subtotal, and "Proceed to Checkout" CTA. |
| **Checkout Flow** | Multi-step checkout: shipping address → payment → order confirmation. |
| **Order Model** | `Order`, `OrderItem` database models. Order creation on checkout completion. |
| **Server-Side Cart** | Persist cart items in the database for authenticated users. Merge guest cart on login. |
| **Product Images** | Support multiple images per product. Image upload to cloud storage (e.g., Cloudinary, S3). |

### 13.2 Medium-Term

| Feature | Description |
|---------|-------------|
| **Wishlist / Favorites** | Allow users to save perfumes to a wishlist for later. Heart icon on product cards. |
| **Reviews & Ratings** | User-submitted reviews with star ratings. Average rating on product cards. |
| **Order History** | User profile page showing past orders with status tracking. |
| **Advanced Search** | Full-text search with autocomplete, search suggestions, and recent searches. |
| **Email Notifications** | Order confirmation, shipping updates, password reset emails. |

### 13.3 Long-Term

| Feature | Description |
|---------|-------------|
| **Multi-Vendor Support** | Allow multiple perfume sellers to list products. Vendor registration, vendor dashboard, commission system. |
| **Admin Dashboard** | Internal dashboard for marketplace admin: product management, order management, user management, analytics. |
| **Payment Integration** | Stripe, PayPal, or other payment gateway integration for real transactions. |
| **Internationalization (i18n)** | Multi-language support for global marketplace reach. |
| **Mobile App** | React Native or Flutter mobile application. |
| **Analytics & Recommendations** | Track user behavior, implement "Recommended for You" based on browsing history and preferences. |
| **Fragrance Quiz** | Interactive quiz to help users discover their ideal scent profile. |

---

## Appendix: Quick Reference

### API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login |
| `GET` | `/api/auth/me` | Protected | Get current user |
| `GET` | `/api/products` | Public | List products (filters, sort, pagination) |
| `GET` | `/api/products/:slug` | Public | Get product detail |
| `POST` | `/api/products` | Internal | Create product (seed/admin) |

### Frontend Routes Summary

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page with hero, featured products |
| `/shop` | ShopPage | Product listing with filters and sorting |
| `/products/:slug` | ProductDetailPage | Full product information |
| `/auth` | AuthPage | Login, register, guest access |

### Key Commands

```bash
# Install all dependencies
npm install

# Start backend dev server
npm run dev:server

# Start frontend dev server
npm run dev:client

# Run database migration
npm run db:migrate

# Seed database
npm run db:seed

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
cd server && npx prisma studio
```
