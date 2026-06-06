# Root Agent Guidelines

## 1. Project Overview
This repository is a monorepo for an e-commerce platform built specifically for perfumes. It contains three main workspaces:
- `client`: A React/Vite frontend using TailwindCSS and Zustand.
- `server`: An Express/Node.js backend using Prisma ORM and PostgreSQL.
- `shared`: A shared package containing Zod schemas, types, and constants.

## 2. Directory Structure
- `/client`: Frontend application.
- `/server`: Backend API.
- `/shared`: Common DTOs and type definitions.

## 3. Workflow & Dependencies
- **Installation**: Always run `npm install` from the root directory to utilize npm workspaces effectively.
- **Starting the app**: 
  - To start the backend: `npm run dev:server`
  - To start the frontend: `npm run dev:client`
  - Ensure PostgreSQL is running and `.env` files are configured before starting the backend.

## 4. General Guidelines
- Always write code in TypeScript.
- Favor functional programming paradigms over object-oriented ones when writing React components.
- Include JSDoc comments for any complex logic or exported functions to facilitate team collaboration.
- Ensure any modifications to schemas in `/shared` are immediately propagated to both `client` and `server`.
