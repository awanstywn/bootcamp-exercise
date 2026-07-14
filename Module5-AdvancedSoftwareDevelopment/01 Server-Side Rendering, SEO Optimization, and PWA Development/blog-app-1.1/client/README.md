# Frontend Client

This is the React frontend for the Fullstack Blog Application.

## Overview

The client layer is responsible for presenting a modern, fast, and responsive user interface to the end user. It communicates with the backend API to fetch and mutate content.

## Architecture & Tech Stack

- **Framework:** React 19 bundled with Vite.
- **Styling:** Tailwind CSS 4 for utility-first styling.
- **State Management:** Zustand 5 for lightweight global state (e.g., authentication status).
- **Routing:** React Router v7.
- **Performance:** Configured for Server-Side Rendering (SSR) to improve SEO and Initial Page Load times. Also implements Workbox for offline PWA capabilities.

## Setup & Scripts

_Note: All installation commands must be run from the root directory (e.g. `npm install package -w client`)._

Available scripts within the client:

- `npm run dev:client`: Starts the Vite development server.
- `npm run build:client`: Compiles the client bundle for production.
- `npm run build:server`: Compiles the SSR entry point.

## Relationship to Monorepo

- **Dependencies:** The client depends on the `shared` layer for TypeScript definitions (DTOs, Enums).
- **Restrictions:** The client must NEVER import backend-specific packages (like `@prisma/client` or `express`) or backend models directly. This will crash the bundler.
