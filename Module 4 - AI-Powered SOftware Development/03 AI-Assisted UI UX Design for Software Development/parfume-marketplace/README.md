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
- **Browsing & Search**: Guests can view the perfume catalog, read detailed product descriptions, and utilize the global search bar and filter sidebar (`client/src/pages/ShopPage.tsx` Lines 30-38 & 73 & 91).
- **Restricted Actions**: Cannot add items to the cart or proceed to checkout. Any attempt to purchase will prompt a modal to register or login (`client/src/pages/ProductDetailPage.tsx` Lines 68-75, inside `handleAddToCart`).

### 2. Buyer (Registered User)
- **Shopping**: Full access to browse products, search, add items to the cart, and checkout securely.
- **Address Management** (`client/src/pages/ProfilePage.tsx`): 
  - **Save Address:** (Line 48) Validates current address count (`< 5`) and calls `addAddress` API hook.
  - **Select Default:** (Line 210) Sets the active shipping address via `setDefaultAddress`.
  - **Delete Address:** (Line 217) Removes a saved address from the account via `deleteAddress`.
- **Order Tracking**: View a comprehensive history of placed orders and their current fulfillment statuses (`client/src/pages/ProfilePage.tsx` Lines 43-46 using `useSWR(API_ROUTES.ORDERS.LIST_MY_ORDERS)`).
- **Payment Verification**: Upload image proofs of transfer/payment for pending orders to update their status to `PAID` (`client/src/pages/ProfilePage.tsx` Lines 57-65 via `handleUploadProof`).

### 3. Admin
- **Admin Route Protection (Backend)**: Restricts administrative endpoints globally by applying Express middlewares: `router.use(authGuard, adminGuard)` (`server/src/routes/admin.routes.ts` Line 32).
- **Product Management** (`server/src/routes/admin.routes.ts`):
  - **Create:** (Line 37) `router.post("/products", uploadMultiple, createProduct)`.
  - **Update/Delete:** (Lines 38-39) Updates or removes existing product records.
  - **Manage Stock:** (Line 40) Modifies product inventory quantities.
  - **Upload Images:** (Lines 41-42) Attaches multiple image assets to an existing product.
- **Order Management**: View all customer orders and manually update order statuses (e.g., verifying payments or marking as `COMPLETED`/`SHIPPED`) (`server/src/routes/admin.routes.ts` Line 46).
- **Store View**: Admins can view the live storefront in a "read-only" mode (cart and purchasing disabled), complete with a persistent floating CTA to quickly return to the Admin Dashboard.
- **CMS Management**: Update dynamic textual content for informational pages like About Us, Shipping Info, and Returns (`server/src/routes/admin.routes.ts` Line 55).

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


## 🔐 Demo Credentials
For testing the application, you can use the following demo accounts:
- **Admin:** `admin@parfume.com` | Password: `admin123` | Role: `ADMIN`
- **Customer:** `test@example.com` | Password: `password123` | Role: `CUSTOMER`
