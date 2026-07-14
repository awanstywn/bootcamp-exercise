# AI Agent Instructions - Client Layer

## Context

You are operating within the `client/` directory, which is the React + Vite frontend of the blog application.

## Specific Rules

- **State Management:** Always use `Zustand`. Do not introduce Redux, MobX, or Context API for global state.
- **Styling:** Always use `Tailwind CSS 4`. Do not write custom CSS, CSS modules, or introduce styled-components unless absolutely necessary.
- **UI/UX Aesthetics:** The frontend must feel modern and premium. Prioritize rich aesthetics, glassmorphism, responsive hover states, and smooth micro-animations. Never create "basic" or "MVP-style" designs if building new components.
- **API Communication:** Use the pre-configured `api` instance from `src/lib/axios.ts` for all HTTP requests to ensure cookies/interceptors work correctly.
- **Architecture Restrictions:** Do NOT import `@prisma/client` or any files from the `server/` directory into this workspace. If you need types, import them from the `shared/` workspace.

## Global Rules

For project-wide rules (such as dependency installation rules and DTO patterns), please refer to the root `AGENTS.md`.
