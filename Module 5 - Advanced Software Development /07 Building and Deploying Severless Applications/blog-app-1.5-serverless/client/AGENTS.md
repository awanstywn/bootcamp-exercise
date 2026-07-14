# Client-Side AI Agent Instructions

These instructions are CRITICAL when working on the `client/` layer.

## Architecture

- **Framework:** React 19+ (via Vite with SSR)
- **Styling:** Tailwind CSS 4
- **Dockerized:** Containerized into a single Docker image along with the backend.

## Guidelines

- **Components:** Keep components pure and "dumb" where possible. Extract complex data-fetching logic into custom hooks or Zustand actions.
- **State:** Use Zustand (`store/authStore.ts`) for global state. Keep local UI state to `useState` or `useReducer`.
- **API Calls:** ALWAYS use the configured Axios instance (`lib/axios.ts`). NEVER use raw `fetch()` because it will bypass authentication interceptors (which handle seamless JWT refresh token rotation).
- **Type Safety (Strict DTOs):** You MUST import shared types (e.g., `UserDTO`, `Role`) from `../../shared/src/types.ts`. NEVER define local interfaces (e.g., `interface User { ... }`) to match API responses in the frontend. The `shared` folder is the ONLY source of truth. The `any` type is strictly forbidden.
- **React Hooks:** Follow strict React hooks rules. Do not suppress `exhaustive-deps` warnings. Declare functions outside of `useEffect` or wrap them in `useCallback` if they are dependencies.
- **Vite Environment Variables:** Remember that this is a Vite project. Environment variables MUST be prefixed with `VITE_` (e.g., `VITE_API_URL`) and accessed via `import.meta.env.VITE_API_URL`. Never use `process.env` in the client code.
- **SSR Compatibility:** Be cautious when accessing browser-only APIs (`window`, `document`, `localStorage`). Ensure these are accessed only in `useEffect` hooks or after verifying `typeof window !== 'undefined'` since this app utilizes Server-Side Rendering. Use `Helmet` for managing `<head>` tags (SEO) securely during SSR.
- **Media Optimization:** Ensure all Cloudinary images utilize `q_auto` and `f_auto` parameters to optimize Core Web Vitals (LCP) automatically.
