# 🖥️ Todo App — Frontend

> React + TypeScript + Vite frontend for Todo List App v2.0

## Tech Stack

| Technology | Version | Function |
|-----------|-------|--------|
| React | ^18.x | UI component library |
| TypeScript | ^5.x | Type safety |
| Vite | ^6.x | Bundler + dev server |
| Zustand | ^5.x | Global state management |
| Axios | ^1.x | HTTP client + interceptors |
| React Router DOM | ^6.x | Client-side routing |
| @dnd-kit | ^6.x | Drag-and-drop |
| Formik + Yup | ^2.x / ^1.x | Form management + validation |
| Tailwind CSS | v4 | Utility-first styling |

## 📁 Structure

```
src/
├── config/api.ts               ← Base URL to Express backend
├── lib/axios.ts                ← Axios instance + JWT interceptor + 401 handler
│
├── types/types.ts              ← All TypeScript interfaces/types
│
├── services/                   ← API call layer (HTTP to backend)
│   ├── authService.ts          ← POST /api/auth/register, /login, /logout
│   ├── todoService.ts          ← CRUD /api/todos + clearCompleted + reorder
│   ├── shareService.ts         ← POST /api/share
│   └── analyticsService.ts     ← GET /api/analytics
│
├── store/                      ← Zustand global state
│   ├── useAuthStore.ts         ← user, token, isLoggedIn, signIn/signUp/logout
│   └── useTodoStore.ts         ← todos[], CRUD actions, optimistic UI, reorder
│
├── components/
│   ├── analytics/AnalyticsWidget.tsx ← Stats card + progress bar + mini chart (Sidebar)
│   ├── controls/Search.tsx     ← Search bar + sort/filter dropdowns
│   ├── layout/Header.tsx       ← App title, theme toggle, Profile Sidebar (Analytics)
│   ├── layout/AppShell.tsx     ← Dark/light mode wrapper
│   ├── shared/EmptyState.tsx   ← Empty list illustration
│   └── todo/
│       ├── TodoList.tsx        ← DnD context + SortableContext
│       ├── TodoItem.tsx        ← Inline edit, toggle, delete, share, drag
│       ├── TodoInput.tsx       ← New task input field
│       └── TodoFooter.tsx      ← Counter + clear completed + filter tabs
│
├── pages/
│   ├── SignIn.tsx              ← Login form (Formik + Yup)
│   ├── SignUp.tsx              ← Register form
│   ├── TodoPage.tsx            ← Main dashboard (Todo List)
│   └── SharedTodoPage.tsx      ← Read-only shared todo view (public)
│
├── hooks/
│   ├── useFilteredTodos.ts    ← Combine filter + sort + search
│   └── useIdleTimer.ts        ← Auto-logout after 5 min idle
│
├── utils/sortTodos.ts         ← Pure sort function (manual, date, alpha)
├── validations/authSchema.ts  ← Yup schemas for auth forms
├── App.tsx                    ← Route config: /, /signin, /signup, /shared/:id
├── App.css                    ← Component-specific styles
├── main.tsx                   ← React root mount + BrowserRouter
└── index.css                  ← Global styles + Tailwind imports
```

## 🚀 Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Build production bundle
npm run preview    # Preview production build
```

## 🔑 Environment Variables

```bash
# .env
VITE_API_BASE_URL=http://localhost:4000
```

> In Vite, all variables starting with `VITE_` are automatically available in the client via `import.meta.env`

## 📐 Key Patterns

### 1. Optimistic UI
```
User action → Update state INSTANTLY → Send to API → If failed: ROLLBACK
```
Examples in `useTodoStore.ts`: `addTodo()`, `toggleTodo()`, `removeTodo()`

### 2. Axios Interceptors
- **Request**: Automatically inject `Authorization: Bearer <token>` from Zustand store
- **Response**: If 401/403 (not from login) → clear auth → redirect /signin

### 3. Zustand Persist
- `useAuthStore`: persist `user`, `userToken`, `isLoggedIn` to localStorage
- `useTodoStore`: persist `isDarkMode`, `todos`, `sort`, `filter` to localStorage

### 4. Protected Routes
```tsx
// App.tsx
<Route path="/" element={isLoggedIn ? <TodoPage /> : <Navigate to="/signin" />} />
```

## ⚙️ Connection to Backend

Frontend communicates with the backend via REST API:
- Base URL configured in `config/api.ts`
- All HTTP calls via `lib/axios.ts` (automatically injects JWT)
- Backend must be running on port 4000 (or according to `VITE_API_BASE_URL`)
