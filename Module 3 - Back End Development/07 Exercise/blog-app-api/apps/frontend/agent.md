# AI Agent Context: Frontend

## 🏗 Architecture
- **API Layer** (`src/api/`) — Axios client with interceptors. All HTTP calls go through `client.ts`.
- **Stores** (`src/stores/`) — Zustand stores. Two stores: `auth.store.ts` (auth state) and `article.store.ts` (CRUD state).
- **Components** — Organized by concern: `layout/`, `ui/`, `article/`, `auth/`.
- **Pages** — One per route. Rendered inside `Layout.tsx` via React Router's `<Outlet />`.

## 🎨 Styling Rules
- **Tailwind CSS v4** — CSS-first config. No `tailwind.config.js`. Custom tokens defined in `@theme` directive in `index.css`.
- Custom utility classes (e.g., `glass-card`, `gradient-text`, `glass-nav`) are defined in `index.css`.
- Use Tailwind utilities inline. Only create custom CSS classes for complex multi-property effects.

## 📋 Patterns
- **Zod validation** is done client-side before API calls using schemas from `@blog-app/shared`.
- **Toast notifications** via `react-hot-toast` — called inside Zustand store actions, not components.
- **Loading states** managed in Zustand stores (`isLoading` flag).
- **Auth flow** — Token stored in `localStorage`, hydrated on app start via `useAuthStore.hydrate()`.
- **API proxy** — Vite proxies `/api/*` requests to `http://localhost:3000` (configured in `vite.config.ts`).

## 🔧 Standards
- All comments in English.
- Path alias: `@/` maps to `src/` (configured in `tsconfig.json` + `vite.config.ts`).
- TypeScript strict mode. Avoid `any`.
