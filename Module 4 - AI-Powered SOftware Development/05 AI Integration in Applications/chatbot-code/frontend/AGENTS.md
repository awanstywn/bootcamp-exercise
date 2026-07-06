# Agent Instructions (Frontend)

These rules apply when writing or modifying code in the `/frontend` directory.

## Stack & Tech

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript (`.ts`, `.tsx`)
- **Styling**: Tailwind CSS

## Coding Style & Architecture

- **Functional Components**: Always use React functional components and hooks. Never use class components.
- **State Management**: Use `Zustand` for all global state (e.g., chat history, loading states). Do not introduce Redux or the Context API unless absolutely necessary. Rely on the global `<ErrorBoundary>` component in `src/components/ErrorBoundary.tsx` for catching unexpected React rendering crashes.
- **Styling**: Strictly use Tailwind CSS utility classes. Avoid inline styles or creating new `.css` files unless overriding global browser defaults.
- **Imports**: Due to `verbatimModuleSyntax`, strictly use `import type { ... }` when importing TypeScript interfaces or types. Common types (`Message`, `Conversation`) must be imported from the root `../../shared/types.ts` file.

## Boundaries

- **Formatting Constraints**: Do not install or configure ESLint or Prettier in this directory. Rely entirely on the root configuration.
- **Network Requests**: The Vite development server is configured to proxy requests starting with `/api` to the backend. Do not hardcode `http://localhost:3001` in your `fetch` or `axios` calls; use relative paths (e.g., `/api/chat/conversations`).
