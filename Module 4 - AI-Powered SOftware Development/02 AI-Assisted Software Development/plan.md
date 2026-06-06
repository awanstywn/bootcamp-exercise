# Product Management Dashboard — Implementation Plan

## 1. Project Overview

A full-stack **Product Management Dashboard** application built as a monorepo. The system provides authenticated users with a rich dashboard to manage products and categories, featuring a data table with search/filter/pagination, modal-based CRUD operations, and a clean, modern UI.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript (both client & server) |
| **Frontend** | Vite + React 18 |
| **Styling** | Tailwind CSS |
| **Backend** | Express.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Auth** | JSON Web Tokens (JWT) + bcrypt |
| **Monorepo** | npm workspaces |
| **Validation** | Zod (shared schemas between client & server) |

---

## 3. Project Structure

```
root/
├── package.json              # Root package.json (npm workspaces)
├── tsconfig.base.json        # Shared TypeScript config
├── plan.md                   # This file
├── .gitignore
├── .env.example
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Database seeder
│   │   └── migrations/       # Prisma migrations
│   └── src/
│       ├── index.ts          # Entry point — Express app bootstrap
│       ├── app.ts            # Express app configuration (middleware, routes)
│       ├── config/
│       │   └── env.ts        # Environment variable validation & export
│       ├── middleware/
│       │   ├── auth.ts       # JWT authentication middleware
│       │   ├── validate.ts   # Zod request validation middleware
│       │   └── errorHandler.ts  # Global error handler
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── product.routes.ts
│       │   └── category.routes.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── product.controller.ts
│       │   └── category.controller.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── product.service.ts
│       │   └── category.service.ts
│       ├── lib/
│       │   └── prisma.ts     # Prisma client singleton
│       └── types/
│           └── express.d.ts  # Express type augmentation (req.user)
│
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx          # React entry point
│       ├── App.tsx           # Root component with routing
│       ├── index.css         # Tailwind directives + global styles
│       ├── api/
│       │   ├── client.ts     # Axios instance with interceptors
│       │   ├── auth.api.ts   # Auth API calls
│       │   ├── product.api.ts # Product API calls
│       │   └── category.api.ts # Category API calls
│       ├── components/
│       │   ├── layout/
│       │   │   ├── DashboardLayout.tsx   # Sidebar + header shell
│       │   │   ├── Sidebar.tsx
│       │   │   └── Header.tsx
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── DataTable.tsx
│       │   │   ├── Pagination.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Toast.tsx
│       │   │   └── ConfirmDialog.tsx
│       │   ├── products/
│       │   │   ├── ProductTable.tsx
│       │   │   ├── ProductForm.tsx       # Used in both Add & Edit modals
│       │   │   ├── AddProductModal.tsx
│       │   │   └── EditProductModal.tsx
│       │   └── categories/
│       │       ├── CategoryTable.tsx
│       │       ├── CategoryForm.tsx
│       │       ├── AddCategoryModal.tsx
│       │       └── EditCategoryModal.tsx
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx         # Overview / stats
│       │   ├── ProductsPage.tsx          # Product data table
│       │   └── CategoriesPage.tsx        # Category management
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useProducts.ts
│       │   ├── useCategories.ts
│       │   └── useDebounce.ts
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── types/
│       │   ├── product.ts
│       │   ├── category.ts
│       │   ├── auth.ts
│       │   └── api.ts                    # Pagination, API response types
│       └── utils/
│           ├── formatCurrency.ts
│           └── cn.ts                     # Tailwind className merge utility
│
└── shared/                              # (Optional) Shared types/validation
    ├── package.json
    └── src/
        └── schemas/
            ├── product.schema.ts         # Zod schemas for product
            ├── category.schema.ts        # Zod schemas for category
            └── auth.schema.ts            # Zod schemas for auth
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │       │     Product      │       │   Category   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id       PK  │       │ id          PK   │       │ id       PK  │
│ name         │       │ name             │  FK   │ name         │
│ email   UQ   │       │ sku         UQ   │◄──────│ createdAt    │
│ password     │       │ categoryId  FK   │───────►│ updatedAt    │
│ createdAt    │       │ price            │       └──────────────┘
│ updatedAt    │       │ stock            │
└──────────────┘       │ status           │
                       │ createdAt        │
                       │ updatedAt        │
                       └──────────────────┘
```

### 4.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Category {
  id        String    @id @default(uuid())
  name      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]

  @@map("categories")
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  EMPTY
}

model Product {
  id         String        @id @default(uuid())
  name       String
  sku        String        @unique
  categoryId String
  category   Category      @relation(fields: [categoryId], references: [id])
  price      Float
  stock      Int           @default(0)
  status     ProductStatus @default(ACTIVE)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@map("products")
}
```

### 4.3 Validation Rules

| Field | Rule |
|---|---|
| `sku` | Unique across all products |
| `price` | Must be greater than 0 (`price > 0`) |
| `stock` | Must be non-negative (`stock >= 0`) |
| `name` | Required, non-empty string |
| `categoryId` | Must reference a valid existing category |
| `email` | Must be a valid email format, unique |
| `password` | Minimum 6 characters |

---

## 5. API Design

**Base URL:** `http://localhost:3000/api`

All authenticated endpoints require the header: `Authorization: Bearer <token>`

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login & receive JWT | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |

#### Request/Response Examples

**POST /api/auth/register**
```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }

// Response 201
{ "message": "User registered successfully", "user": { "id": "...", "name": "John Doe", "email": "john@example.com" } }
```

**POST /api/auth/login**
```json
// Request
{ "email": "john@example.com", "password": "secret123" }

// Response 200
{ "token": "eyJhbGciOiJIUzI1NiIs...", "user": { "id": "...", "name": "John Doe", "email": "john@example.com" } }
```

### 5.2 Product Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | List products (paginated, filterable) | Yes |
| `GET` | `/api/products/:id` | Get a single product | Yes |
| `POST` | `/api/products` | Create a new product | Yes |
| `PUT` | `/api/products/:id` | Update a product | Yes |
| `DELETE` | `/api/products/:id` | Delete a product | Yes |

#### Query Parameters for `GET /api/products`

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page |
| `search` | string | `""` | Search by name or SKU |
| `category` | string | `""` | Filter by category ID |
| `status` | string | `""` | Filter by status (`ACTIVE`, `INACTIVE`, `EMPTY`) |
| `sortBy` | string | `"createdAt"` | Sort field |
| `sortOrder` | string | `"desc"` | Sort direction (`asc` / `desc`) |

#### Response Format for `GET /api/products`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "sku": "PRD-001",
      "category": { "id": "uuid", "name": "Electronics" },
      "price": 29.99,
      "stock": 150,
      "status": "ACTIVE",
      "createdAt": "2026-05-28T12:00:00Z",
      "updatedAt": "2026-05-28T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 5.3 Category Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/categories` | List all categories | Yes |
| `GET` | `/api/categories/:id` | Get a single category | Yes |
| `POST` | `/api/categories` | Create a new category | Yes |
| `PUT` | `/api/categories/:id` | Update a category | Yes |
| `DELETE` | `/api/categories/:id` | Delete a category (only if no products linked) | Yes |

---

## 6. Frontend Pages & Components

### 6.1 Pages

| Page | Route | Description |
|---|---|---|
| **Login** | `/login` | Email/password login form |
| **Register** | `/register` | Registration form |
| **Dashboard** | `/` | Overview with stats cards (total products, categories, low stock alerts, status breakdown) |
| **Products** | `/products` | Full data table with search, filter, pagination, add/edit/delete |
| **Categories** | `/categories` | Category list with add/edit/delete |

### 6.2 Dashboard Page — Stats Cards

| Card | Data |
|---|---|
| Total Products | Count of all products |
| Total Categories | Count of all categories |
| Low Stock Alert | Products with `stock < 10` |
| Active Products | Count where `status = ACTIVE` |

### 6.3 Product Data Table

**Columns:**
| Column | Sortable | Notes |
|---|---|---|
| Name | Yes | Product name |
| SKU | Yes | Unique identifier |
| Category | No | Category name (from relation) |
| Price | Yes | Formatted as currency |
| Stock | Yes | Numeric |
| Status | No | Badge: green (ACTIVE), gray (INACTIVE), red (EMPTY) |
| Actions | No | Edit button, Delete button |

**Table Features:**
- 🔍 **Search bar** — searches across `name` and `sku`
- 🏷️ **Category filter** — dropdown to filter by category
- 📊 **Status filter** — dropdown to filter by status
- 📄 **Pagination** — configurable page size (10, 25, 50)
- ↕️ **Column sorting** — click column headers to sort

### 6.4 Add / Edit Product Modal

**Form Fields:**
| Field | Type | Validation |
|---|---|---|
| Name | Text input | Required |
| SKU | Text input | Required, unique |
| Category | Dropdown select | Required, populated from categories API |
| Price | Number input | Required, > 0 |
| Stock | Number input | Required, >= 0 |
| Status | Dropdown select | ACTIVE / INACTIVE / EMPTY |

### 6.5 Category Management Page

- Data table with columns: **Name**, **Product Count**, **Created At**, **Actions**
- Add Category modal (name input)
- Edit Category modal (name input)
- Delete with confirmation (blocked if category has linked products)

---

## 7. Authentication Flow

```
┌─────────┐      POST /auth/login       ┌──────────┐
│  Client  │ ──────────────────────────► │  Server  │
│  (React) │                             │ (Express)│
│          │ ◄────────────────────────── │          │
│          │     { token, user }         │          │
│          │                             │          │
│  Store   │   GET /api/products         │  Verify  │
│  token   │ ──────────────────────────► │  JWT in  │
│  in      │   Authorization: Bearer... │  auth    │
│ localStorage                          │ middleware│
└─────────┘                             └──────────┘
```

1. User submits login form → `POST /api/auth/login`
2. Server validates credentials, returns JWT + user object
3. Client stores JWT in `localStorage`
4. Axios interceptor attaches `Authorization: Bearer <token>` to all subsequent requests
5. Server `auth` middleware verifies JWT on protected routes
6. On 401 response, client redirects to `/login`

---

## 8. Application Workflow

### 8.1 High-Level Architecture Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│                                                                       │
│  ┌─────────┐    ┌──────────┐    ┌────────────┐    ┌──────────────┐   │
│  │  React   │───►│  React   │───►│   Axios    │───►│   HTTP       │   │
│  │  Pages   │    │  Hooks   │    │  Client +  │    │   Request    │──────┐
│  │          │◄───│          │◄───│Interceptor │◄───│   Response   │◄─┐   │
│  └─────────┘    └──────────┘    └────────────┘    └──────────────┘  │   │
│       ▲                                                              │   │
│       │  React Router (protected routes)                             │   │
│       │  AuthContext (global auth state)                              │   │
└───────┼──────────────────────────────────────────────────────────────┘   │
        │                                                                  │
        │ Redirect to /login if 401                                        │
        │                                                                  │
┌───────┼──────────────────────────────────────────────────────────────┐   │
│       │              SERVER (Express.js)                              │   │
│       │                                                               │   │
│  ┌────┴─────┐    ┌──────────┐    ┌────────────┐    ┌──────────────┐  │   │
│  │  Routes  │───►│Middleware │───►│ Controller │───►│   Service    │  │◄──┘
│  │          │    │(auth,    │    │            │    │   Layer      │  │
│  │          │    │validate) │    │            │    │              │  │
│  └──────────┘    └──────────┘    └────────────┘    └──────┬───────┘  │
│                                                           │          │
│                                              ┌────────────▼───────┐  │
│                                              │   Prisma ORM       │  │
│                                              │   (Query Builder)  │  │
│                                              └────────┬───────────┘  │
└───────────────────────────────────────────────────────┼──────────────┘
                                                        │
                                               ┌────────▼───────────┐
                                               │    PostgreSQL      │
                                               │    Database        │
                                               │  ┌──────────────┐  │
                                               │  │ users        │  │
                                               │  │ categories   │  │
                                               │  │ products     │  │
                                               │  └──────────────┘  │
                                               └────────────────────┘
```

### 8.2 Request Lifecycle

Every API request follows this pipeline:

```
Incoming Request
       │
       ▼
┌──────────────┐
│  CORS Check  │──── Reject if origin not allowed
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  JSON Parser │──── Parse request body
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Router     │──── Match route (e.g. GET /api/products)
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ Auth         │────►│ 401          │  (if no/invalid token)
│ Middleware   │     │ Unauthorized │
└──────┬───────┘     └──────────────┘
       │ (token valid, req.user set)
       ▼
┌──────────────┐     ┌──────────────┐
│ Validation   │────►│ 400          │  (if body/params invalid)
│ Middleware   │     │ Bad Request  │
│ (Zod)        │     └──────────────┘
└──────┬───────┘
       │ (data validated)
       ▼
┌──────────────┐
│ Controller   │──── Extract params, call service, format response
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Service      │──── Business logic + Prisma DB queries
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Response     │──── JSON response (200/201/204)
│              │
└──────────────┘
       │
  (if error thrown at any point)
       │
       ▼
┌──────────────┐
│ Error        │──── Catch all errors, format as JSON
│ Handler      │     { message, statusCode, errors? }
└──────────────┘
```

### 8.3 User Journey Workflows

#### Workflow 1: Registration & First Login

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  User   │     │ Register    │     │  Login       │     │  Dashboard  │
│  Opens  │────►│  Page       │────►│  Page        │────►│  Page       │
│  App    │     │             │     │              │     │  (stats)    │
└─────────┘     └─────────────┘     └──────────────┘     └─────────────┘
                 │                   │                     │
                 │ POST /auth/       │ POST /auth/         │ GET /api/
                 │ register          │ login                │ products?stats
                 │                   │                      │ (aggregated)
                 ▼                   ▼                      ▼
              User created       JWT returned           Stats loaded
              → Redirect         → Store in             → Display cards
                to Login           localStorage
```

**Step-by-step:**
1. User navigates to `/register` → fills in name, email, password
2. Client sends `POST /api/auth/register` → server hashes password with bcrypt, creates user in DB
3. On success → user is redirected to `/login`
4. User fills in email + password → client sends `POST /api/auth/login`
5. Server validates credentials → returns JWT + user object
6. Client stores JWT in `localStorage`, sets user in `AuthContext`
7. React Router redirects to `/` (Dashboard)
8. Dashboard page fetches aggregated stats and displays cards

#### Workflow 2: Product Management (Full CRUD Cycle)

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRODUCTS PAGE                               │
│                                                                  │
│  ┌─────────┐   ┌────────────┐   ┌──────────┐   ┌────────────┐  │
│  │ Search  │   │  Category  │   │  Status  │   │ + Add      │  │
│  │ Bar     │   │  Filter    │   │  Filter  │   │ Product    │  │
│  └────┬────┘   └─────┬──────┘   └────┬─────┘   └─────┬──────┘  │
│       │              │               │                │          │
│       └──────────────┴───────────────┘                │          │
│                      │                                │          │
│          GET /api/products?search=                     │          │
│          &category=&status=&page=&limit=               │          │
│                      │                                │          │
│                      ▼                                ▼          │
│  ┌──────────────────────────────┐    ┌────────────────────────┐  │
│  │        DATA TABLE            │    │   ADD PRODUCT MODAL    │  │
│  │                              │    │                        │  │
│  │  Name | SKU | Cat | Price.. │    │  Name: [___________]   │  │
│  │  ─────┼─────┼─────┼────────│    │  SKU:  [___________]   │  │
│  │  Item │PRD01│Elec │ $29.99 │    │  Category: [▼ Select]  │  │
│  │       │     │     │  [✏️][🗑]│    │  Price: [___________]  │  │
│  │                              │    │  Stock: [___________]  │  │
│  │  ◄ 1 2 3 ... 5 ►  [10▼]    │    │  Status: [▼ ACTIVE]   │  │
│  └──────────────────────────────┘    │                        │  │
│                                      │  [Cancel] [Save]       │  │
│            ┌──────┐                  └────────────────────────┘  │
│            │EDIT  │                            │                 │
│            │MODAL │  ◄── Click ✏️ on row        │                 │
│            │(same │                   POST /api/products         │
│            │form, │                            │                 │
│            │pre-  │                            ▼                 │
│            │filled│                  Product created →           │
│            └──┬───┘                  Table refreshes             │
│               │                                                  │
│      PUT /api/products/:id                                       │
│               │                                                  │
│               ▼                                                  │
│     Product updated → Table refreshes                            │
│                                                                  │
│  ┌────────────────────────────────────────┐                      │
│  │      DELETE CONFIRMATION DIALOG        │                      │
│  │                                        │  ◄── Click 🗑 on row │
│  │  "Delete Product X? This cannot        │                      │
│  │   be undone."                          │                      │
│  │                                        │                      │
│  │         [Cancel]  [Delete]             │                      │
│  └────────────────────────────────────────┘                      │
│               │                                                  │
│      DELETE /api/products/:id                                    │
│               │                                                  │
│               ▼                                                  │
│     Product deleted → Table refreshes → Toast notification       │
└──────────────────────────────────────────────────────────────────┘
```

**Step-by-step:**

**View Products:**
1. User navigates to `/products`
2. `useProducts` hook fires `GET /api/products?page=1&limit=10`
3. Server queries DB with Prisma (includes category relation), returns paginated data
4. `ProductTable` renders rows with formatted prices, status badges

**Search & Filter:**
5. User types in search bar → `useDebounce` waits 300ms → re-fetches with `?search=...`
6. User selects a category filter → re-fetches with `?category=<id>`
7. User selects a status filter → re-fetches with `?status=ACTIVE`
8. All filters combine: `GET /api/products?search=phone&category=abc&status=ACTIVE&page=1`

**Add Product:**
9. User clicks "Add Product" → `AddProductModal` opens
10. `useCategories` hook loads categories for the dropdown
11. User fills form → client-side Zod validation runs
12. On submit → `POST /api/products` with body → server validates → Prisma creates record
13. On success → modal closes → toast "Product created" → table re-fetches

**Edit Product:**
14. User clicks ✏️ on a row → `EditProductModal` opens pre-filled with product data
15. User modifies fields → submits → `PUT /api/products/:id`
16. On success → modal closes → toast "Product updated" → table re-fetches

**Delete Product:**
17. User clicks 🗑 on a row → `ConfirmDialog` opens
18. User confirms → `DELETE /api/products/:id`
19. On success → dialog closes → toast "Product deleted" → table re-fetches

#### Workflow 3: Category Management

```
┌──────────────────────────────────────────────────────────────┐
│                    CATEGORIES PAGE                            │
│                                                              │
│  ┌─────────────────────────────────┐   ┌──────────────────┐  │
│  │        CATEGORY TABLE           │   │ + Add Category   │  │
│  │                                 │   └────────┬─────────┘  │
│  │  Name     │ Products │ Actions  │            │            │
│  │  ─────────┼──────────┼────────  │            ▼            │
│  │  Electron │    12    │ [✏️][🗑]  │   ┌─────────────────┐  │
│  │  Clothing │     8    │ [✏️][🗑]  │   │ ADD CATEGORY    │  │
│  │  Food     │     0    │ [✏️][🗑]  │   │                 │  │
│  │                                 │   │ Name: [_______]  │  │
│  └─────────────────────────────────┘   │                 │  │
│                                        │ [Cancel] [Save]  │  │
│                                        └─────────────────┘  │
│                                                              │
│  DELETE GUARD:                                               │
│  ┌──────────────────────────────────────────────────┐        │
│  │  ⚠️ Cannot delete "Electronics"                   │        │
│  │  This category has 12 linked products.            │        │
│  │  Remove or reassign products before deleting.     │        │
│  │                          [OK]                     │        │
│  └──────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

**Step-by-step:**
1. User navigates to `/categories` → `GET /api/categories` → table renders with product counts
2. **Add:** Click "Add Category" → modal → enter name → `POST /api/categories` → table refreshes
3. **Edit:** Click ✏️ → modal pre-filled → modify name → `PUT /api/categories/:id` → table refreshes
4. **Delete:** Click 🗑 → `DELETE /api/categories/:id`
   - If category has **0 products** → deleted successfully → toast notification
   - If category has **linked products** → server returns `400` → error toast: "Cannot delete category with linked products"

#### Workflow 4: Session & Auth State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH STATE MACHINE                            │
│                                                                 │
│   App Loads                                                     │
│      │                                                          │
│      ▼                                                          │
│   Check localStorage                                            │
│   for JWT token                                                 │
│      │                                                          │
│      ├─── Token found ──────► GET /api/auth/me                  │
│      │                              │                           │
│      │                    ┌─────────┴──────────┐                │
│      │                    │                    │                 │
│      │               200 OK              401 Expired            │
│      │                    │                    │                 │
│      │                    ▼                    ▼                 │
│      │              Set user in         Clear token             │
│      │              AuthContext         from storage            │
│      │                    │                    │                 │
│      │                    ▼                    │                 │
│      │              Render               ┌────┘                 │
│      │              Dashboard            │                      │
│      │                                   │                      │
│      └─── No token ─────────────────────►│                      │
│                                          │                      │
│                                          ▼                      │
│                                    Redirect to                  │
│                                    /login                       │
│                                                                 │
│   ─── During Session ───────────────────────────────────        │
│                                                                 │
│   Any API call returns 401                                      │
│      │                                                          │
│      ▼                                                          │
│   Axios response interceptor catches 401                        │
│      │                                                          │
│      ▼                                                          │
│   Clear token + user → Redirect to /login                       │
│                                                                 │
│   ─── Logout ───────────────────────────────────────────        │
│                                                                 │
│   User clicks "Logout" in Header                                │
│      │                                                          │
│      ▼                                                          │
│   Clear token from localStorage                                 │
│   Clear user from AuthContext                                   │
│      │                                                          │
│      ▼                                                          │
│   Redirect to /login                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Data Flow Summary

| Action | Frontend | API Call | Backend Logic | DB Operation |
|---|---|---|---|---|
| **Register** | Submit form | `POST /auth/register` | Hash password, create user | `INSERT INTO users` |
| **Login** | Submit form | `POST /auth/login` | Verify password, sign JWT | `SELECT FROM users` |
| **View Products** | Load page | `GET /products?...` | Parse query, build filters | `SELECT FROM products JOIN categories` |
| **Add Product** | Submit modal | `POST /products` | Validate, check SKU unique | `INSERT INTO products` |
| **Edit Product** | Submit modal | `PUT /products/:id` | Validate, check existence | `UPDATE products SET ...` |
| **Delete Product** | Confirm dialog | `DELETE /products/:id` | Check existence | `DELETE FROM products` |
| **View Categories** | Load page | `GET /categories` | Fetch with product count | `SELECT FROM categories` + count |
| **Add Category** | Submit modal | `POST /categories` | Validate unique name | `INSERT INTO categories` |
| **Edit Category** | Submit modal | `PUT /categories/:id` | Validate unique name | `UPDATE categories SET ...` |
| **Delete Category** | Confirm dialog | `DELETE /categories/:id` | Check no linked products | `DELETE FROM categories` (or reject) |

---

## 9. Implementation Steps

### Phase 1: Project Initialization

- [ ] **Step 1.1** — Create root `package.json` with npm workspaces configured for `server`, `client`, and `shared`
- [ ] **Step 1.2** — Create `tsconfig.base.json` at root with shared TypeScript compiler options
- [ ] **Step 1.3** — Create `.gitignore` (node_modules, dist, .env, prisma generated)
- [ ] **Step 1.4** — Create `.env.example` with all required environment variables

### Phase 2: Shared Package Setup

- [ ] **Step 2.1** — Initialize `shared/package.json` with Zod dependency
- [ ] **Step 2.2** — Create Zod validation schemas for Product, Category, and Auth
- [ ] **Step 2.3** — Export schemas and inferred TypeScript types

### Phase 3: Backend Setup

- [ ] **Step 3.1** — Initialize `server/package.json` with dependencies (express, prisma, @prisma/client, bcrypt, jsonwebtoken, cors, zod, dotenv)
- [ ] **Step 3.2** — Create `server/tsconfig.json` extending base config
- [ ] **Step 3.3** — Set up Prisma: `npx prisma init`
- [ ] **Step 3.4** — Write `schema.prisma` with User, Category, Product models (as defined in Section 4)
- [ ] **Step 3.5** — Run `npx prisma migrate dev --name init` to create tables
- [ ] **Step 3.6** — Create Prisma client singleton (`lib/prisma.ts`)
- [ ] **Step 3.7** — Set up Express app (`app.ts`) with cors, json parser, routes, error handler
- [ ] **Step 3.8** — Create server entry point (`index.ts`)

### Phase 4: Backend — Authentication

- [ ] **Step 4.1** — Create auth middleware (`middleware/auth.ts`) — JWT verification, `req.user` augmentation
- [ ] **Step 4.2** — Create validation middleware (`middleware/validate.ts`) — generic Zod validator
- [ ] **Step 4.3** — Create global error handler (`middleware/errorHandler.ts`)
- [ ] **Step 4.4** — Create auth service (`services/auth.service.ts`) — register, login logic with bcrypt
- [ ] **Step 4.5** — Create auth controller (`controllers/auth.controller.ts`)
- [ ] **Step 4.6** — Create auth routes (`routes/auth.routes.ts`) — POST /register, POST /login, GET /me

### Phase 5: Backend — Category CRUD

- [ ] **Step 5.1** — Create category service (`services/category.service.ts`)
- [ ] **Step 5.2** — Create category controller (`controllers/category.controller.ts`)
- [ ] **Step 5.3** — Create category routes (`routes/category.routes.ts`) — full CRUD, all protected

### Phase 6: Backend — Product CRUD

- [ ] **Step 6.1** — Create product service (`services/product.service.ts`) — with pagination, search, filters, sorting
- [ ] **Step 6.2** — Create product controller (`controllers/product.controller.ts`)
- [ ] **Step 6.3** — Create product routes (`routes/product.routes.ts`) — full CRUD, all protected

### Phase 7: Backend — Seed Data

- [ ] **Step 7.1** — Write `prisma/seed.ts` to populate sample categories, products, and a test user
- [ ] **Step 7.2** — Add seed script to `server/package.json`

### Phase 8: Frontend Setup

- [ ] **Step 8.1** — Scaffold Vite React TypeScript app in `client/`
- [ ] **Step 8.2** — Install dependencies: tailwindcss, postcss, autoprefixer, react-router-dom, axios, lucide-react (icons)
- [ ] **Step 8.3** — Configure Tailwind CSS (`tailwind.config.ts`, `postcss.config.js`)
- [ ] **Step 8.4** — Configure Vite dev server proxy (`vite.config.ts`) — proxy `/api` to Express backend
- [ ] **Step 8.5** — Set up global CSS (`index.css`) with Tailwind directives and design tokens

### Phase 9: Frontend — Auth & Routing

- [ ] **Step 9.1** — Create Axios client instance with JWT interceptor (`api/client.ts`)
- [ ] **Step 9.2** — Create `AuthContext` with login/logout/register state management
- [ ] **Step 9.3** — Create `useAuth` hook
- [ ] **Step 9.4** — Build `LoginPage` component
- [ ] **Step 9.5** — Build `RegisterPage` component
- [ ] **Step 9.6** — Set up React Router in `App.tsx` with protected routes (redirect to `/login` if unauthenticated)

### Phase 10: Frontend — Layout

- [ ] **Step 10.1** — Build `DashboardLayout` (sidebar + header + main content area)
- [ ] **Step 10.2** — Build `Sidebar` with navigation links (Dashboard, Products, Categories)
- [ ] **Step 10.3** — Build `Header` with user info and logout button

### Phase 11: Frontend — Reusable UI Components

- [ ] **Step 11.1** — `Button` component (variants: primary, secondary, danger, ghost; sizes: sm, md, lg)
- [ ] **Step 11.2** — `Input` component (with label, error message support)
- [ ] **Step 11.3** — `Select` component (dropdown with label)
- [ ] **Step 11.4** — `Modal` component (overlay, title, close button, body, footer)
- [ ] **Step 11.5** — `DataTable` component (generic table with column definitions, loading state)
- [ ] **Step 11.6** — `Pagination` component (page numbers, prev/next, page size selector)
- [ ] **Step 11.7** — `SearchBar` component (with debounced input)
- [ ] **Step 11.8** — `Badge` component (status indicator with color variants)
- [ ] **Step 11.9** — `Toast` component (success/error notifications)
- [ ] **Step 11.10** — `ConfirmDialog` component (delete confirmation)

### Phase 12: Frontend — Dashboard Page

- [ ] **Step 12.1** — Create API functions to fetch dashboard stats
- [ ] **Step 12.2** — Build `DashboardPage` with stats cards (total products, categories, low stock, active products)

### Phase 13: Frontend — Product Management

- [ ] **Step 13.1** — Create product API functions (`api/product.api.ts`)
- [ ] **Step 13.2** — Create `useProducts` hook (fetch, create, update, delete with state management)
- [ ] **Step 13.3** — Build `ProductTable` component
- [ ] **Step 13.4** — Build `ProductForm` component (shared between add & edit)
- [ ] **Step 13.5** — Build `AddProductModal` component
- [ ] **Step 13.6** — Build `EditProductModal` component
- [ ] **Step 13.7** — Build `ProductsPage` — assemble table + search + filters + modals

### Phase 14: Frontend — Category Management

- [ ] **Step 14.1** — Create category API functions (`api/category.api.ts`)
- [ ] **Step 14.2** — Create `useCategories` hook
- [ ] **Step 14.3** — Build `CategoryTable` component
- [ ] **Step 14.4** — Build `CategoryForm` component
- [ ] **Step 14.5** — Build `AddCategoryModal` and `EditCategoryModal`
- [ ] **Step 14.6** — Build `CategoriesPage` — assemble table + modals

### Phase 15: Polish & Finalize

- [ ] **Step 15.1** — Add loading spinners and skeleton states
- [ ] **Step 15.2** — Add error boundaries and error states
- [ ] **Step 15.3** — Add toast notifications for all CRUD operations
- [ ] **Step 15.4** — Test all flows end-to-end (register → login → CRUD products → CRUD categories → logout)
- [ ] **Step 15.5** — Review responsive design (mobile-friendly sidebar, tables)
- [ ] **Step 15.6** — Write `README.md` with setup instructions

---

## 10. Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/product_dashboard

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Client (Vite)
VITE_API_URL=http://localhost:3000/api
```

---

## 11. Scripts Summary

### Root `package.json`
```json
{
  "scripts": {
    "dev": "npm run dev --workspaces",
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client",
    "build": "npm run build --workspaces",
    "db:migrate": "npm run db:migrate --workspace=server",
    "db:seed": "npm run db:seed --workspace=server"
  }
}
```

### Server `package.json` scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### Client `package.json` scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 12. Key Dependencies

### Server
| Package | Purpose |
|---|---|
| `express` | HTTP framework |
| `@prisma/client` | Database ORM client |
| `prisma` | ORM CLI (devDependency) |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT token generation & verification |
| `cors` | Cross-origin requests |
| `zod` | Request validation |
| `dotenv` | Environment variable loading |
| `tsx` | TypeScript execution (dev) |
| `@types/express`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/cors` | Type definitions |

### Client
| Package | Purpose |
|---|---|
| `react`, `react-dom` | UI library |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling |
| `lucide-react` | Icon library |
| `zod` | Client-side form validation |
| `clsx`, `tailwind-merge` | Tailwind class utilities |
