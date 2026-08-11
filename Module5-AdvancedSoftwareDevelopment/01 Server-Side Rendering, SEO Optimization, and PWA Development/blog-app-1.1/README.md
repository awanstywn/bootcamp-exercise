# Fullstack Blog Application

Welcome to the Fullstack Blog Application! This is a modern, responsive, and robust blog platform designed for a single admin user to manage and publish high-quality content.

## Architecture & Monorepo Structure

This project uses npm workspaces to manage a full-stack application divided into three main layers:

- **`client/` (Frontend):** A React 19 application built with Vite, styled with Tailwind CSS 4, and utilizing Zustand for state management. Features Server-Side Rendering (SSR) and PWA support.
- **`server/` (Backend):** An Express 5 API running on Node.js, utilizing Prisma ORM with PostgreSQL.
- **`shared/` (Shared Contracts):** A shared workspace containing TypeScript types, interfaces, and enums that guarantee a strict API contract between the client and server.

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- PostgreSQL Database

### Installation

**CRITICAL RULE:** Because this is an NPM Workspaces monorepo, you must run the install command _only_ at the root level. Do **not** run `npm install` inside the `client` or `server` folders!

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` in both the `client` and `server` directories. Ensure you configure your `DATABASE_URL` in `server/.env`.

### Database Setup

Run these commands from the root directory to initialize the database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Running the Application

### Development Mode

Boot up both the React frontend and the Express backend simultaneously:

```bash
npm run dev
```

## 🔐 Demo Credentials
For testing the application, you can use the following demo accounts:
- **Admin:** `admin@blogapp.com` | Password: `password123` | Role: `ADMIN`
- **Author:** `johndoe@example.com` | Password: `password123` | Role: `AUTHOR`

### Production Build

Build both the client and server:

```bash
npm run build
npm run start
```

## Code Quality & Best Practices

- Run linting: `npm run lint`
- Auto-format code: `npm run format`
