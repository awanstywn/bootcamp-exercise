# Agent Instructions (Backend)

These rules apply when writing or modifying code in the `/backend` directory.

## Stack & Tech

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript (`.ts`)

## Coding Style & Architecture

- **Thin Controllers**: Controllers should only handle HTTP request parsing, response formatting, and error catching. Delegate complex business logic or external API calls to files in `src/services/`.
- **JSON Error Responses**: Always return structured JSON errors when exceptions occur. Ensure appropriate HTTP status codes (e.g., 400 for bad input, 500 for server errors).
- **Type Safety**: Strictly define common interfaces in the root `/shared/types.ts` file and avoid using `any`. If an error object must be typed (like in a catch block), prefer `unknown` or cast safely.
- **Configuration**: All AI configurations (e.g., model selection, system prompts) must be stored in environment variables (`.env`) rather than hardcoded in the source code.

## Boundaries

- **Formatting Constraints**: Do not install or configure ESLint or Prettier in this directory. Rely entirely on the root configuration.
- **Server State**: Do not attempt to add a real database (like PostgreSQL or MongoDB) unless explicitly requested by the user. Rely on the existing in-memory array setup in `src/store.ts`.
- **Streaming**: Any modifications to the `/messages` route must preserve the existing Server-Sent Events (SSE) logic.
