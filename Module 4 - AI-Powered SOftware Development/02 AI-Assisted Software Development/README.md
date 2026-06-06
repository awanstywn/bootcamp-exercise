# Antigravity Product Management Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## Elevator Pitch
The Antigravity Product Management Dashboard is a comprehensive, full-stack monorepo application designed to streamline product and category inventory tracking. It solves the problem of decentralized inventory data by offering a unified, real-time interface for businesses to manage stock, categorize products, and view overarching dashboard statistics.

## Visuals Placeholder
![App Screenshot](./docs/screenshot.png)

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, React Router, Axios
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Shared**: Zod for end-to-end type safety and validation
- **Tooling**: TypeScript, pnpm/npm

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm
- PostgreSQL database server running

## Installation & Local Setup
1. **Clone the repository**
2. **Install dependencies at the root:**
   ```bash
   npm install
   ```
3. **Setup the Database:**
   Ensure PostgreSQL is running. Navigate to the `server` folder, set up your `.env` (using `.env.example` as a guide), and run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Usage
To run the entire application stack concurrently from the root directory:
```bash
npm run dev
```
This command spins up both the Vite dev server for the React client and the nodemon dev server for the Express backend.

## Monorepo Architecture
This repository uses a structured monorepo architecture divided into three main layers:
- [`/client`](./client): The React-based frontend application.
- [`/server`](./server): The Express-based REST API backend.
- [`/shared`](./shared): Common Zod schemas and TypeScript interfaces used by both the client and server to ensure end-to-end type safety.

## License
MIT License
