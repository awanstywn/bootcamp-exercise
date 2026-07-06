# Global Agent Instructions

These are the global context rules for AI coding agents working within this repository.

## Stack & Tech

- **Language**: TypeScript (`.ts`, `.tsx`).
- **Formatting**: Managed globally via ESLint (`eslint.config.mjs`) and Prettier (`.prettierrc`).
- **Monorepo Style**: A single `package.json` at the root orchestrates `frontend` and `backend` dependencies where possible, but `frontend` and `backend` contain their own run scripts and dependencies.

## Coding Style

- **Language**: All comments, variables, error messages, and documentation must be exclusively in English. **Do not use Indonesian or any other language.**
- **Formatting Constraints**: Do not create or modify `.eslintrc` or `eslint.config.js` within subdirectories (e.g., `frontend` or `backend`). Rely on the root configuration.
- **Layer Separation**: Code changes must respect the boundaries between the `frontend` (React/Vite) and `backend` (Express/Node) layers. Common TypeScript interfaces must be placed in the `/shared` directory and imported using relative paths to prevent duplication.

## Commands

- **Install**: `npm run install:all`
- **Lint**: `npm run lint` (run from the root)
- **Format**: `npm run format` (run from the root)
- **Run**: `npm run dev` (run from the root to start both servers concurrently)

## Boundaries

- Do not modify the root ESLint configuration without explicit user confirmation.
- Ensure any new UI components or backend routes adhere to the existing conventions detailed in `frontend/AGENTS.md` and `backend/AGENTS.md`.
