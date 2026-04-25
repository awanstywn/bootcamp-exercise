# 🤖 Agent Context — Frontend

> Context for the AI agent working on the React + Vite frontend.

## Quick Reference

| Item | Value |
|------|-------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State Management | Zustand 5 (with persist) |
| Port | 5173 (dev) |
| Dev server | `npm run dev` |

## Architecture

### 1. Optimistic UI
Whenever a user performs an action (e.g., toggling a todo, adding a task, reordering), the UI state in Zustand is updated **immediately** before the network request finishes.
- If the API call fails, the change is rolled back.
- This provides a snappy, app-like feel.

### 2. State Management (Zustand)
- `useAuthStore.ts`: Manages `user`, `token`, and `isLoggedIn`. It is persisted to `localStorage`.
- `useTodoStore.ts`: Manages the `todos` array, sorting, filtering, and theme preferences. Also persisted.

### 3. API Communication (Axios)
All HTTP requests go through `lib/axios.ts`:
- **Request Interceptor**: Automatically injects the JWT token (`Authorization: Bearer <token>`) from `useAuthStore`.
- **Response Interceptor**: Catches `401 Unauthorized` responses and automatically logs the user out.

### 4. Components & Layout
- `App.tsx` handles Routing (`react-router-dom`). Protected routes redirect to `/signin`.
- `Header.tsx` acts as the global navigation bar and contains the **Profile Sidebar**, which renders the `AnalyticsWidget.tsx`.
- `TodoPage.tsx` is the main dashboard orchestrating the Todo List.

## Conventions

- **File Naming**: PascalCase for React components (`TodoItem.tsx`), camelCase for utilities and hooks (`useTodoStore.ts`).
- **Props**: Use `interface` to define component props.
- **Styling**: Stick to Tailwind utility classes. Use `index.css` for custom fonts and base reset.
- **Form Handling**: Use `Formik` and `Yup` for complex forms (SignIn, SignUp).

## Connecting to Backend

The frontend communicates with the backend API located at `VITE_API_BASE_URL` (usually `http://localhost:4000`).
The Share feature redirects users to `/s/:code` on the backend, which resolves and redirects back to `http://localhost:5173/shared/:id` on the frontend.
