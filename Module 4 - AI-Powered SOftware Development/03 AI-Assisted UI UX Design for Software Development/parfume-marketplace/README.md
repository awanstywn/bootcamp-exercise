# Parfume Marketplace Monorepo

Welcome to the Parfume Marketplace project. This repository contains the source code for a full-stack e-commerce application tailored specifically for exploring, purchasing, and managing premium perfumes. The project is organized as an npm monorepo to seamlessly manage the frontend, backend, and shared typings.

## 🌟 Project Architecture

This application utilizes a modern, robust tech stack designed for high performance and developer productivity:

- **Frontend (`/client`)**: Built with React 19 and Vite. Styled using Tailwind CSS v4 for a beautiful, responsive user interface. Global state is managed by Zustand, and server-state caching is handled via SWR.
- **Backend (`/server`)**: A fast, reliable REST API powered by Node.js and Express. It connects to a PostgreSQL database utilizing Prisma ORM for type-safe database queries.
- **Shared (`/shared`)**: Contains Zod validation schemas and TypeScript definitions that serve as the single source of truth across both the client and server.

## 👥 User Roles & Features

The application supports three distinct user roles, each with specific permissions and features. 
**Seeded Admin Account:** For testing administrative features, log in using Email: `admin@parfume.com` and Password: `admin123`.

### 1. Guest
- **Browsing & Search**: Guests can view the perfume catalog, read detailed product descriptions, and utilize the global search bar and filter sidebar (filtering by category, scent family, and price).
- **Restricted Actions**: Cannot add items to the cart or proceed to checkout. Any attempt to purchase will prompt a modal to register or login.

**Implementation Details: Guest Purchase Protection**
- **Location:** `client/src/pages/ProductDetailPage.tsx` (Lines 68 - 75)
- **Logic:** The `handleAddToCart` function verifies user session using `if (!user)` and directly calls `setIsGuestModalOpen(true)` to trigger the registration modal, preventing anonymous cart additions.

### 2. Buyer (Registered User)
- **Shopping**: Full access to browse products, search, add items to the cart, and checkout securely.
- **Address Management**: Save, edit, and manage up to 5 shipping addresses. Addresses can be selected dynamically during checkout or managed from the user Profile page.
- **Order Tracking**: View a comprehensive history of placed orders and their current fulfillment statuses.
- **Payment Verification**: Upload image proofs of transfer/payment for pending orders to update their status to `PAID`.

**Implementation Details: Buyer Operations**
- **Address Management (`client/src/pages/ProfilePage.tsx`)**:
  - **Save Address:** Line 48 (`handleAddAddress`) — Validates current address count and creates a new entry.
  - **Select Default:** Line 210 (`setDefaultAddress`) — Sets the preferred active shipping address.
  - **Delete Address:** Line 217 (`deleteAddress`) — Removes a saved address from the user's account.
- **Order Tracking (`client/src/pages/ProfilePage.tsx`)**: 
  - **Fetch History:** Lines 43-46 — Uses `useSWR(API_ROUTES.ORDERS.LIST_MY_ORDERS)` to fetch active/past orders.
- **Payment Verification (`client/src/pages/ProfilePage.tsx`)**:
  - **Upload Proof:** Lines 57-65 (`handleUploadProof`) — Submits form data containing the transfer proof image.

### 3. Admin
- **Admin Dashboard**: A comprehensive admin panel to view metrics, manage the CMS, and navigate administrative tasks.
- **Product Management**: Full CRUD operations for products. Manage inventory stocks, delete products, and upload/manage multiple product images.
- **Order Management**: View all customer orders and manually update order statuses (e.g., verifying payments or marking as `COMPLETED`/`SHIPPED`).
- **Store View**: Admins can view the live storefront in a "read-only" mode (cart and purchasing disabled), complete with a persistent floating CTA to quickly return to the Admin Dashboard.
- **CMS Management**: Update dynamic textual content for informational pages like About Us, Shipping Info, and Returns.

**Implementation Details: Admin Route Protection & Operations (Backend)**
- **Global Middleware Protection (`server/src/routes/admin.routes.ts`)**: 
  - **Apply Guard:** Line 32 — `router.use(authGuard, adminGuard)` restricts endpoints to admin access.
- **Product Management (`server/src/routes/admin.routes.ts`)**:
  - **Create:** Line 37 — `router.post("/products", uploadMultiple, createProduct)`
  - **Update/Delete:** Lines 38-39 — Updates or removes existing product records.
  - **Manage Stock:** Line 40 — Modifies product inventory quantities.
  - **Upload Images:** Lines 41-42 — Attaches multiple image assets to an existing product.
- **Order Management (`server/src/routes/admin.routes.ts`)**:
  - **Update Status:** Line 46 — Updates order statuses to `PAID`, `COMPLETED`, or `SHIPPED`.
- **CMS Management (`server/src/routes/admin.routes.ts`)**:
  - **Update Content:** Line 55 — Modifies the textual content on dummy info pages.

**Implementation Details: Product Search & Filtering**
- **Location:** `client/src/pages/ShopPage.tsx`
- **Setup Params:** Lines 30-38 — Extracts filter variables (search, category, scentFamily, minPrice, maxPrice, sort) dynamically from the URL.
- **Apply Filters:** Lines 73 & 91 — Serializes active `searchParams` to mutate the URL without refreshing the application.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL running locally or via Docker

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd parfume-marketplace
   ```

2. **Install dependencies:**
   Since this is a monorepo, running `npm install` at the root will automatically install dependencies for all workspaces.
   ```bash
   npm install
   ```

### Database Setup

Navigate to the server directory and set up your environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

Sync the Prisma schema with your database and seed initial data:
```bash
npx prisma db push
npx prisma db seed
```

### Running the Application

You can start the development servers simultaneously from the root directory using npm workspaces:

**Start Backend API:**
```bash
npm run dev:server
```

**Start Frontend Client:**
```bash
npm run dev:client
```

## 📚 Collaboration & Documentation

All codebase files contain JSDoc documentation headers detailing their objective, functional relation to other modules, and how the underlying logic operates. Mentors and teammates can refer to the inline documentation for immediate context.

Please refer to the `agent.md` and `README.md` files within each workspace (`client`, `server`, `shared`) for specific layer-level instructions and best practices.

## 📄 License
This project is proprietary and confidential.
