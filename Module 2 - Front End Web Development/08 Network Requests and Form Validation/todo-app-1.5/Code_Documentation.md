# 📋 Todo List App — Code Documentation

> **Version:** 1.5.0
> **Last Updated:** 2026-04-07
> **Status:** Implemented / Production-ready

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Libraries](#2-tech-stack--libraries)
3. [Features & User Stories](#3-features--user-stories)
4. [File Structure](#4-file-structure)
5. [Components](#5-components)
6. [Data Structures](#6-data-structures)
7. [State Management](#7-state-management)
8. [Network Layer](#8-network-layer)
9. [Form Validation](#9-form-validation)
10. [Key Behaviors & Business Logic](#10-key-behaviors--business-logic)

---

## 1. Project Overview

A clean, responsive **To Do List** web application that allows users to manage their daily tasks effectively. The app supports full task lifecycle: create, read, update, delete. It includes advanced UX features such as real-time search, multi-strategy sorting (including manual drag-and-drop), status-based filtering, and a persistent light/dark theme toggle.

**New in v1.5:** The app migrates from local-only storage to a **Backendless BaaS (Backend-as-a-Service)** backend. All CRUD operations for todos and user authentication are now handled via **REST API calls** using **Axios**. Authentication is upgraded from a simple name/email form to a full **email + password** system with separate **Sign In** and **Sign Up** pages, powered by **Formik** for form state management and **Yup** for schema-based validation (including NIST-aligned password rules). The app implements **Optimistic UI** updates — the UI reflects changes instantly while syncing to the server in the background, with automatic rollback on failure. An **idle timer** automatically logs users out after inactivity.

### What Changed from v1.4 → v1.5

| Area | v1.4 | v1.5 |
| --- | --- | --- |
| **Backend** | None (localStorage only) | Backendless REST API |
| **HTTP Client** | N/A | Axios with interceptors |
| **Authentication** | Name + email form, guest login | Email + password, server-side auth with user-token |
| **Auth Pages** | Single `SignIn.tsx` page | Separate `SignIn.tsx` + `SignUp.tsx` pages |
| **Form Handling** | React `useState` for inputs | Formik (form state) + Yup (validation schemas) |
| **Password Rules** | None | NIST-aligned: min 8 chars, uppercase, lowercase, number, special char |
| **Todo ID** | `crypto.randomUUID()` (`id`) | Backendless auto-generated (`objectId`) |
| **Todo Ownership** | None (single user) | `ownerId` field links tasks to authenticated user |
| **CRUD Operations** | Synchronous state mutations | Async with optimistic updates + rollback on failure |
| **Guest Login** | ✅ Supported | ❌ Removed (real auth required) |
| **Session Management** | localStorage persist | user-token in headers + idle timer auto-logout |
| **User Types** | Discriminated union (`RegularUser \| GuestUser`) | Single `BackendlessUser` interface |
| **File Organization** | `page/` folder | `pages/` folder, `services/`, `config/`, `lib/`, `validations/` |

---

## 2. Tech Stack & Libraries

| Layer | Technology | Purpose |
| --- | --- | --- |
| Language | **TypeScript** | Type safety, better DX, fewer runtime errors |
| Bundler | **Vite** | Fast dev server and optimized production builds |
| UI Framework | **React** | Component-based UI with hooks |
| Styling | **Tailwind CSS v4** | Utility-first CSS, fast responsive design |
| State Management | **Zustand** | Lightweight global state without boilerplate |
| Routing | **React Router** (`react-router-dom`) | Client-side routing for Sign In ↔ Sign Up ↔ Todo page |
| Drag & Drop | **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) | Accessible, performant drag-and-drop for task reordering |
| HTTP Client | **Axios** | Promise-based HTTP client with interceptors for API calls |
| Form Management | **Formik** | Declarative form state, validation, and submission handling |
| Schema Validation | **Yup** | Schema-based validation for form inputs |
| Backend | **Backendless** | BaaS providing REST API for user auth and data persistence |

### Installation

```bash
npm create vite@latest todo-app -- --template react-ts
cd todo-app
npm install
npm install zustand
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-router-dom
npm install axios
npm install formik yup
npm install -D tailwindcss @tailwindcss/vite
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_BACKENDLESS_APP_ID=your-app-id-here
VITE_BACKENDLESS_API_KEY=your-api-key-here
```

---

## 3. Features & User Stories

### Feature List

| ID | Feature | Description |
| --- | --- | --- |
| F1 | Theme Toggle | Switch between light and dark mode, persisted to localStorage |
| F2 | To Do List Display | Render the list of tasks with full interaction support |
| F3 | New To Do Input | Input field to create new tasks |
| F4 | Search Input | Real-time text filter on task list |
| F5 | Sort Control | Sort tasks by date or alphabetically; Manual mode enables drag-and-drop |
| F6 | Filter Control | Filter tasks by completion status (All / Active / Completed) |
| F7 | Data Persistence | Save tasks to Backendless backend; UI preferences to localStorage |
| F8 | Authentication | Sign In / Sign Up pages with email+password, Formik+Yup validation, protected routing |
| F9 | Burger Menu | Hamburger button opens slide-in overlay with user profile and sign-out button |
| F10 | Idle Timer | Auto-logout after inactivity (default: 5 minutes) |
| F11 | Optimistic UI | Instant UI updates with automatic rollback on network failure |

---

### User Stories

#### F1 — Theme Toggle

| ID | User Story | Priority |
| --- | --- | --- |
| US-01 | As a user, I can toggle between **light and dark mode** using a toggle button so the app matches my visual preference. | Must Have |
| US-01b | As a user, my **theme preference is saved** to localStorage so it is restored the next time I open the app. | Must Have |

---

#### F2 — To Do List Display

| ID | User Story | Priority |
| --- | --- | --- |
| US-05 | As a user, I can **view all tasks** as a list with a checkbox and text label so I can see my tasks at a glance. | Must Have |
| US-06 | As a user, I can **check or uncheck a checkbox** to toggle a task's completion status (done / not done). | Must Have |
| US-07 | As a user, I can **double-click a task's text** to edit it inline, then press **Enter** to save. | Must Have |
| US-07b | As a user, I can press **Escape while editing** to cancel and revert to the original text. | Must Have |
| US-08 | As a user, I can **delete a task** by clicking a delete button so I can remove it permanently. | Must Have |
| US-09 | As a user, I can **drag and drop tasks** to manually reorder them **only when Sort is set to "Manual"**. Applying any other sort option disables drag-and-drop automatically. | Must Have |
| US-10 | As a user, I can **see a counter** displaying the number of active (incomplete) tasks. | Must Have |
| US-12 | As a user, I can **clear all completed tasks** at once using a "Clear Completed" button. | Must Have |
| US-13 | As a user, **completed tasks are visually distinct** (strikethrough text, muted color) so I can differentiate done vs. pending tasks. | Must Have |
| US-14 | As a user, I see an **empty state message** when no tasks exist or no results match my current search/filter. | Must Have |

---

#### F3 — New To Do Input

| ID | User Story | Priority |
| --- | --- | --- |
| US-02 | As a user, I can **type a new task** in the input field and press **Enter** (or click an Add button) to add it to the list. | Must Have |
| US-02b | As a user, I **cannot submit an empty or whitespace-only task** — the input is validated before submission. | Must Have |
| US-02c | As a user, the **input field is cleared and re-focused** after successfully adding a task so I can quickly add the next one. | Must Have |

---

#### F4 — Search Input

| ID | User Story | Priority |
| --- | --- | --- |
| US-03 | As a user, I can **type in a search field** to filter the task list in real time so I can quickly find specific tasks. | Must Have |
| US-03b | As a user, I see a **"No results found"** message when my search query matches no tasks. | Must Have |
| US-03c | As a user, I can **clear the search** with an × button to instantly return to the full list. | Must Have |

---

#### F5 — Sort Control

| ID | User Story | Priority |
| --- | --- | --- |
| US-04 | As a user, I can **sort tasks** using a dropdown with the following options: **Manual** (default), **Newest**, **Oldest**, **A → Z**, **Z → A**. | Must Have |
| US-04b | As a user, the **currently active sort option is visually highlighted** in the dropdown so I always know the current sort state. | Must Have |
| US-04c | When I **apply any sort other than Manual**, drag-and-drop reordering is **disabled** and the drag handle is hidden. | Must Have |
| US-04d | When I **drag and drop a task**, the sort automatically **switches back to "Manual"** mode, preserving my custom order. | Must Have |

> **Sort Conflict Resolution Rule:**
>
> - `sort === "manual"` → drag-and-drop is **enabled**; tasks are ordered by `manual_index`.
> - `sort !== "manual"` → drag-and-drop is **disabled**; tasks are ordered by the active sort algorithm.
> - Performing a drag-and-drop action always sets `sort` back to `"manual"`.

---

#### F6 — Filter Control

| ID | User Story | Priority |
| --- | --- | --- |
| US-11 | As a user, I can **filter tasks by status** using a dropdown with options: **All** (default), **Active**, **Completed**. | Must Have |
| US-11b | As a user, **search and filter work simultaneously** — e.g., searching "meeting" within "Active" tasks narrows results correctly. | Must Have |

---

#### F7 — Data Persistence

| ID | User Story | Priority |
| --- | --- | --- |
| US-16 | As a user, my **tasks are saved to the Backendless backend** so they persist across devices and sessions. | Must Have |
| US-17 | As a user, my **sort and filter preferences are saved** to localStorage and restored on next visit. | Should Have |

---

#### F8 — Authentication

| ID | User Story | Priority |
| --- | --- | --- |
| US-18 | As a user, I can **sign in with my email and password** so the app authenticates me against the server. | Must Have |
| US-18b | As a new user, I can **sign up with my name, email, and password** to create an account. | Must Have |
| US-18c | As a user, my **password is validated** against strict rules (min 8 chars, uppercase, lowercase, number, special character). | Must Have |
| US-18d | As a user, I can **toggle password visibility** on sign in and sign up forms using an eye icon button. | Must Have |
| US-19 | As a user, if I am **not logged in**, I am **redirected to the Sign In page** automatically. | Must Have |
| US-19b | As a user, if I am **already logged in** and visit `/signin` or `/signup`, I am **redirected to the home page** automatically. | Must Have |
| US-19c | As a new user, after **successful sign up**, I am **redirected to the Sign In page** with a success message. | Must Have |
| US-20 | As a user, my **login state is persisted** to localStorage so I stay logged in after refreshing. | Must Have |
| US-21 | As a user, I can **sign out** from the burger menu to return to the Sign In page. | Must Have |

---

#### F9 — Burger Menu Overlay

| ID | User Story | Priority |
| --- | --- | --- |
| US-22 | As a user, I can click the **burger menu button** (☰) in the header to open a **slide-in panel** showing my profile and a sign-out button. | Must Have |
| US-22b | As a user, I can **close the overlay** by clicking the ✕ button, clicking the dark backdrop, or pressing the Escape key. | Must Have |
| US-23 | As a user, I can see my **name initial in an avatar circle**, my full name, and email in the overlay panel. | Must Have |

---

#### F10 — Idle Timer (new in v1.5)

| ID | User Story | Priority |
| --- | --- | --- |
| US-24 | As a user, if I am **inactive for 5 minutes**, my session is **automatically ended** and I am redirected to Sign In. | Should Have |

---

#### F11 — Optimistic UI (new in v1.5)

| ID | User Story | Priority |
| --- | --- | --- |
| US-25 | As a user, my **UI updates immediately** when I add, edit, toggle, or delete a task — without waiting for the server. | Must Have |
| US-25b | As a user, if the **server fails** to save my change, the UI **automatically rolls back** to the previous state. | Must Have |

---

## 4. File Structure

```
todo-app-1.5/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── controls/
│   │   │   ├── Search.tsx              # Search input + Sort/Filter icon buttons w/ dropdowns
│   │   │   ├── SortDropDown.tsx        # Sort options dropdown content
│   │   │   └── FilterDropDown.tsx      # Filter options dropdown content
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            # Root layout wrapper (applies theme class)
│   │   │   └── Header.tsx              # Header with title, theme toggle, and burger menu overlay
│   │   │
│   │   ├── shared/
│   │   │   └── EmptyState.tsx          # Empty/no-results illustration + message
│   │   │
│   │   └── todo/
│   │       ├── TodoList.tsx            # DnD context + renders sorted/filtered list
│   │       ├── TodoItem.tsx            # Single task row (checkbox, text, edit, delete, drag)
│   │       ├── TodoInput.tsx           # New task input field
│   │       └── TodoFooter.tsx          # Active counter + Clear Completed + Filter tabs
│   │                                   #   exports: TodoFooter (default), MobileFilterBar (named)
│   │
│   ├── config/
│   │   └── backendless.ts             # Backendless APP_ID, API_KEY, BASE_URL constants
│   │
│   ├── lib/
│   │   └── axios.ts                   # Pre-configured Axios instance with interceptors
│   │
│   ├── services/
│   │   ├── authService.ts             # Auth API methods (register, login, logout)
│   │   └── todoService.ts             # Todo CRUD API methods (fetch, create, update, delete, bulkDelete)
│   │
│   ├── pages/
│   │   ├── SignIn.tsx                  # Sign In page (Formik form + Yup validation)
│   │   ├── SignUp.tsx                  # Sign Up page (Formik form + NIST password rules)
│   │   └── TodoPage.tsx               # Main dashboard (composes Header, Input, List, Footer)
│   │
│   ├── store/
│   │   ├── useTodoStore.ts            # Zustand store — todo state + async CRUD actions
│   │   └── useAuthStore.ts            # Zustand store — auth state + async auth actions
│   │
│   ├── hooks/
│   │   ├── useFilteredTodos.ts        # Derived: apply search + filter + sort (with useShallow)
│   │   └── useIdleTimer.ts            # Auto-logout after inactivity
│   │
│   ├── types/
│   │   └── types.ts                   # All shared TypeScript types/interfaces
│   │
│   ├── utils/
│   │   └── sortTodos.ts              # Pure sort functions + reindexManual helper
│   │
│   ├── validations/
│   │   └── authSchema.ts             # Yup schemas for login and registration forms
│   │
│   ├── assets/
│   │   ├── dark-bg.png               # Dark theme banner background image
│   │   └── light-bg.png              # Light theme banner background image
│   │
│   ├── App.tsx                       # Root component (routing with protected routes)
│   ├── App.css                       # App-specific styles + responsive breakpoints
│   ├── main.tsx                      # Vite entry point (BrowserRouter wraps App)
│   └── index.css                     # Tailwind v4 imports + global reset + overlay styles
│
├── .env                              # Environment variables (Backendless credentials)
├── index.html
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 5. Components

### `AppShell.tsx`

Wraps the entire app. Reads `isDarkMode` from the store and applies `"dark"` class to the root `<div>`, enabling Tailwind's dark mode variant via the custom `@custom-variant dark` rule.

```
Props: children: ReactNode
Reads from store: isDarkMode
```

---

### `TodoInput.tsx`

Controlled input bound to `newInput` in the store. Submits on Enter key or Add button click. Validates that input is not empty/whitespace before calling `addTodo()`. Clears and re-focuses after submit. Now calls an `async` action that creates the todo on Backendless.

```
Props: none
Store actions used: addTodo (async), setNewInput
Store state used: newInput
```

---

### `Header.tsx`

Displays the app title ("TODO"), a theme toggle button, and a **burger menu button** (☰). The burger button opens a slide-in overlay panel from the right side of the screen.

**Overlay panel contents:**
- Close button (✕) at top-right — rotates 90° on hover
- User avatar circle — shows first letter of user's name (from `BackendlessUser`)
- User name and email
- Horizontal divider
- "Sign out" button — calls async `logout()` to invalidate server session and redirects to `/signin`

**Overlay behavior:**
- `menuOpen` state (React `useState`) controls visibility
- Two CSS layers: backdrop (dark translucent) + panel (glassmorphism slide-in)
- CSS class `open` is toggled to trigger transitions (opacity fade + translateX slide)
- Can be closed by: clicking ✕, clicking backdrop, or pressing Escape key
- Body scroll is locked while overlay is open (`overflow: hidden`)

```
Props:
  isDarkMode: boolean
Store state used: user (from useAuthStore — BackendlessUser | null)
Store actions used: toggleTheme (from useTodoStore), logout (async, from useAuthStore)
Local state: menuOpen (boolean — controls overlay visibility)
Hooks: useState, useEffect, useCallback, useNavigate
```

---

### `SignIn.tsx`

Full-page sign-in form with a responsive split-layout design. On desktop, uses a two-pane layout with a gradient-overlaid banner image on the left and the form on the right. On mobile, uses a single-column layout with a gradient banner at the top.

**Form management:** Uses **Formik** (`useFormik` hook) for controlled form state and **Yup** (`loginSchema`) for validation.

**Layout structure:**
1. AppShell wrapper → applies `.dark` class
2. Mobile banner (< lg) → background image + gradient overlay + TODO title + theme toggle
3. Desktop left pane (≥ lg) → background image + gradient overlay + TODO title + tagline
4. Right pane → form card with email input, password input (with visibility toggle), submit button

**Form contents:**
- Email input (Formik-controlled, validated: required + valid email format)
- Password input with eye icon toggle (Formik-controlled, validated: required)
- "Sign In" button → calls async `signIn(email, password)` via `useAuthStore`
- Success message display (when redirected from successful sign up)
- Error message display (backend auth errors: invalid password, etc.)
- Link to Sign Up page

**Auto-redirect:** `useEffect` watches `isLoggedIn` — when it becomes `true`, navigates to `/`.

```
Props: none
Store state used: isLoggedIn, isLoading, error (from useAuthStore), isDarkMode (from useTodoStore)
Store actions used: signIn (async), clearError (from useAuthStore), toggleTheme (from useTodoStore)
Local state: showPassword (boolean — password visibility toggle)
Hooks: useState, useEffect, useFormik, useNavigate, useLocation
Validation: loginSchema (Yup)
```

---

### `SignUp.tsx`

Full-page registration form with the same responsive split-layout as `SignIn.tsx`.

**Form management:** Uses **Formik** (`useFormik` hook) and **Yup** (`registerSchema`) with strict NIST-aligned password rules.

**Form contents:**
- Full Name input (min 3, max 50 characters)
- Email input (valid email format)
- Password input with eye icon toggle (min 8 chars, uppercase, lowercase, number, special char)
- Confirm Password input with eye icon toggle (must match password)
- "Sign Up" button → calls async `signUp(name, email, password)` via `useAuthStore`
- On success: redirect to `/signin` with success toast message
- Error message display (backend errors: email already registered, etc.)
- Link to Sign In page

```
Props: none
Store state used: isLoggedIn, isLoading, error (from useAuthStore), isDarkMode (from useTodoStore)
Store actions used: signUp (async), clearError (from useAuthStore), toggleTheme (from useTodoStore)
Local state: showPassword, showConfirmPassword (boolean — visibility toggles)
Hooks: useState, useEffect, useFormik, useNavigate
Validation: registerSchema (Yup)
```

---

### `TodoPage.tsx`

Main dashboard page that composes the entire Todo interface. Fetches the user's tasks from Backendless on mount using the authenticated user's `objectId`.

**Layout structure:**
1. AppShell wrapper
2. Banner area (background image + gradient)
3. Content area (z-10, floating above banner): Header → TodoInput → Search → Todo card (TodoList + TodoFooter) → MobileFilterBar → hint text

```
Props: none
Store state used: isDarkMode, isLoading (from useTodoStore), user (from useAuthStore)
Store actions used: fetchTodos (async, from useTodoStore)
Hooks: useEffect
Data flow: useEffect calls fetchTodos(user.objectId) on mount
```

---

### `Search.tsx`

Search row containing three elements side by side:

1. **Search input** — Controlled input bound to `searchInput`. Renders a clear (×) button when text is present. Updates store on every keystroke for real-time filtering.
2. **Sort button** — Icon button that opens a dropdown with `SortDropdown` options (Manual / Newest / Oldest / A→Z / Z→A).
3. **Filter button** — Icon button that opens a dropdown with `FilterDropdown` options (All / Active / Completed).

```
Props: none
Store actions used: setSearchInput
Store state used: searchInput
Local state: isFilterOpen, isSortOpen (dropdown visibility)
Child components: SortDropdown, FilterDropdown
```

---

### `TodoList.tsx`

Core list component. Wraps items in `@dnd-kit`'s `DndContext` and `SortableContext`. Drag-and-drop is conditionally enabled based on `sort === "manual"`. Calls async `reorderTodos()` on drag end, which also resets sort to `"manual"` and syncs new indices to Backendless. Renders `TodoItem` for each task from `useFilteredTodos()`.

```
Props: none
Hooks used: useFilteredTodos
Store actions used: reorderTodos (async)
Store state used: sort, todos
DnD sensors:
  - PointerSensor  (desktop mouse — activationConstraint: distance 5px)
  - TouchSensor    (mobile touch — activationConstraint: delay 200ms, tolerance 5px)
  - KeyboardSensor (keyboard nav — sortableKeyboardCoordinates)
```

---

### `TodoItem.tsx`

Renders a single task row. Uses `useSortable` from `@dnd-kit/sortable` for drag handle. Drag handle is hidden when `sort !== "manual"`. Now uses `objectId` (Backendless) instead of `id` (crypto.randomUUID) for all operations.

**Sub-states:**

- **View mode** (default): shows drag handle (if Manual sort), checkbox, text, delete button
- **Edit mode** (on double-click): shows inline text input, saves on Enter, cancels on Escape

```
Props:
  todo: Todo

Store actions used: toggleTodo (async), updateTodo (async), removeTodo (async)
Store state used: sort (to conditionally show drag handle)
DnD: useSortable using objectId (disabled when sort !== "manual")
```

---

### `TodoFooter.tsx`

Exports two components and one internal helper:

#### `TodoFooter` (default export)

Renders inside the main todo card. Contains:

1. **Active counter** — `"{n} items left"`
2. **Filter tabs** (desktop only, `hidden sm:flex`) — All | Active | Completed via `FilterButtons`
3. **Clear Completed** — always visible; disabled (muted style) when no completed tasks exist

#### `MobileFilterBar` (named export)

Separate card rendered **outside** the main todo container, visible only on mobile (`sm:hidden`). Displays the All | Active | Completed filter tabs in their own rounded card.

#### `FilterButtons` (internal)

Shared button group used by both `TodoFooter` (desktop) and `MobileFilterBar` (mobile). Active filter is highlighted in blue (`#3A7CFD`).

```
Props: none
Store actions used: setFilter, clearCompleted (async)
Store state used: filter, todos (for derived counts)
```

---

### `EmptyState.tsx`

Displayed inside `TodoList` when the filtered/searched list is empty. Shows one of two messages:

- `"No tasks yet — add one above!"` when `todos` is empty
- `"No tasks match your search."` when search/filter yields no results

```
Props:
  reason: "empty" | "no-result"
```

---

## 6. Data Structures

### Todo Types

```typescript
// src/types/types.ts

/** App theme — isDarkMode: true = dark, false = light */
type ThemeType = boolean;

/** Completion status filter */
type FilterType = "all" | "active" | "completed";

/** Sort strategy */
type SortType = "manual" | "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

/** Single task entity — aligned with Backendless "Todos" table */
interface Todo {
  objectId?: string;    // Backendless auto-generated unique ID
  ownerId?: string;     // Auto-set to logged-in user's objectId
  text: string;         // Task label text
  completed: boolean;   // true = done, false = active
  created_at: number;   // Unix timestamp (Date.now()) for date-based sorting
  manual_index: number; // Zero-based position for manual drag-and-drop ordering
}

type TodoArray = Todo[];
```

**Key difference from v1.4:** Todo now uses `objectId` (server-generated) instead of `id` (client-generated via `crypto.randomUUID()`). The `ownerId` field links each task to the authenticated user who created it.

---

### Auth Types (redesigned in v1.5)

```typescript
// src/types/types.ts

/** Backendless user object returned from the login API */
interface BackendlessUser {
  objectId: string;      // Unique user ID from Backendless
  email: string;         // User's email address
  name: string;          // User's display name
  "user-token": string;  // Session token for authenticated requests
}

/** Form values for the Sign In page */
interface SignInFormValues {
  email: string;
  password: string;
}

/** Form values for the Sign Up page */
interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

**Key difference from v1.4:** Removed the discriminated union (`RegularUser | GuestUser`) and `GuestUser` type entirely. Authentication now uses a real `BackendlessUser` with server-issued `user-token`. Guest login is no longer supported.

---

### Auth Store Type

```typescript
// src/types/types.ts

interface AuthState {
  user: BackendlessUser | null;  // null = nobody logged in
  userToken: string | null;      // Session token for API requests
  isLoggedIn: boolean;           // Derived from user !== null
  isLoading: boolean;            // True during auth API calls
  error: string | null;          // Error message from failed auth
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;
```

---

### Todo Store Type

```typescript
// src/types/types.ts

type TodoStore = {
  // ── State ──
  isDarkMode: ThemeType;
  todos: TodoArray;
  newInput: string;
  searchInput: string;
  sort: SortType;
  filter: FilterType;
  isLoading: boolean;    // NEW: true during initial fetch
  isSyncing: boolean;    // NEW: true during background CRUD operations
  error: string | null;  // NEW: error from failed backend operations

  // ── Actions ──
  toggleTheme: () => void;
  setNewInput: (value: string) => void;
  setSearchInput: (value: string) => void;
  setSort: (sort: SortType) => void;
  setFilter: (filter: FilterType) => void;

  // ── Async CRUD Actions (all return Promise<void>) ──
  addTodo: () => Promise<void>;
  toggleTodo: (objectId: string) => Promise<void>;
  updateTodo: (objectId: string, text: string) => Promise<void>;
  removeTodo: (objectId: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  reorderTodos: (activeId: string, overId: string) => Promise<void>;

  // ── Data Fetching ──
  fetchTodos: (ownerId: string) => Promise<void>;
  clearTodos: () => void;
};
```

**Key differences from v1.4:**
- All CRUD actions are now `async` (return `Promise`)
- Added `isLoading`, `isSyncing`, `error` state fields
- Actions take `objectId` instead of `id`
- Added `fetchTodos(ownerId)` and `clearTodos()` actions

---

## 7. State Management

The app uses **two Zustand stores** as the source of truth:

1. **`useTodoStore`** — manages todos, theme, search, sort, filter, and async CRUD
2. **`useAuthStore`** — manages authentication state (user, token, login/signup/logout)

There is no React Context — components import stores directly via hooks.

### Todo Store (`useTodoStore`)

```typescript
// src/store/useTodoStore.ts

const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      isDarkMode: true,
      todos: [],
      newInput: "",
      searchInput: "",
      sort: "manual",
      filter: "all",
      isLoading: false,
      isSyncing: false,
      error: null,

      // --- Local Actions ---
      clearTodos: () => set({ todos: [], error: null, isLoading: false, isSyncing: false }),
      toggleTheme: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setNewInput: (value) => set({ newInput: value }),
      setSearchInput: (value) => set({ searchInput: value }),
      setSort: (sort) => set({ sort }),
      setFilter: (filter) => set({ filter }),

      // --- Async Data Fetching ---
      fetchTodos: async (ownerId) => {
        set({ isLoading: true, error: null });
        try {
          const todos = await todoService.fetchTodos(ownerId);
          set({ todos, isLoading: false });
        } catch (error) { /* set error, isLoading: false */ }
      },

      // --- Async CRUD with Optimistic UI ---
      // Each action:
      // 1. Updates UI immediately (optimistic)
      // 2. Sends request to Backendless
      // 3. On failure: reverts UI to previous state

      addTodo: async () => { /* create + POST to server */ },
      toggleTodo: async (objectId) => { /* optimistic flip + PUT */ },
      updateTodo: async (objectId, text) => { /* optimistic text change + PUT */ },
      removeTodo: async (objectId) => { /* optimistic remove + DELETE */ },
      clearCompleted: async () => { /* optimistic bulk remove + bulk DELETE */ },
      reorderTodos: async (activeId, overId) => {
        /* arrayMove + reindexManual + Promise.all PUTs for changed indices */
      },
    }),
    {
      name: "todo-app-storage",
      partialize: (s) => ({
        isDarkMode: s.isDarkMode,
        todos: s.todos,
        sort: s.sort,
        filter: s.filter,
      }),
    }
  )
);
```

**Key differences from v1.4:**
- All CRUD actions are now `async` and call `todoService` methods
- Implements Optimistic UI pattern (update state → call API → rollback on failure)
- Uses `isSyncing` flag to distinguish initial load (`isLoading`) from background operations
- `reorderTodos` uses `arrayMove` from `@dnd-kit/sortable` and `reindexManual` instead of simple index swap, then syncs changed indices via `Promise.all`
- `addTodo` dynamically imports `useAuthStore` to get `currentUserId` for `ownerId` assignment

---

### Auth Store (`useAuthStore`)

```typescript
// src/store/useAuthStore.ts

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // --- Initial State ---
      user: null,
      userToken: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      // --- Actions ---
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login({ email, password });
          set({ user, userToken: user['user-token'], isLoggedIn: true, isLoading: false });
        } catch (error) {
          set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
        }
      },

      signUp: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register({ name, email, password, confirmPassword: password });
          set({ isLoading: false });
          return true;  // Signal success to component for redirect
        } catch (error) {
          set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();  // Invalidate session on server
          set({ user: null, userToken: null, isLoggedIn: false, isLoading: false });
        } catch (error) { /* set error */ }
      },

      restoreSession: async () => { /* Placeholder for token validation */ },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userToken: state.userToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
```

**Key differences from v1.4:**
- Uses `partialize` to persist only `user`, `userToken`, and `isLoggedIn` (not `isLoading` or `error`)
- All actions are now `async` and delegate to `authService` methods
- `signIn` stores the Backendless `user-token` for authenticated API requests
- `signUp` returns a `boolean` to signal success/failure to the calling component
- `logout` calls server-side logout endpoint to invalidate the session
- Removed `login(name, email)` and `loginAsGuest()` (replaced by `signIn` and `signUp`)
- Added `clearError()` action for dismissing error messages
- Added `restoreSession()` placeholder for future token validation

---

### `useFilteredTodos.ts` — Derived State Hook

```typescript
// src/hooks/useFilteredTodos.ts

export const useFilteredTodos = (): Todo[] => {
  // useShallow optimization: only re-render when these specific values change
  const { todos, searchInput, filter, sort } = useTodoStore(
    useShallow((state) => ({
      todos: state.todos,
      searchInput: state.searchInput,
      filter: state.filter,
      sort: state.sort,
    }))
  );

  // Step 1: Filter by status
  const byStatus = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  // Step 2: Filter by search query (case-insensitive)
  const bySearch = byStatus.filter((t) =>
    t.text.toLowerCase().includes(searchInput.toLowerCase().trim()),
  );

  // Step 3: Sort
  return sortTodos(bySearch, sort);
};
```

**New in v1.5:** Uses `useShallow` from `zustand/react/shallow` for performance optimization — prevents unnecessary re-renders when unrelated store properties change.

---

### `useIdleTimer.ts` — Auto-Logout Hook (new in v1.5)

```typescript
// src/hooks/useIdleTimer.ts

export const useIdleTimer = (timeoutMinutes = 5) => {
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => logout(), timeoutMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start the initial timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn, logout, timeoutMinutes]);
};
```

**How it works:**
- Monitors `mousemove`, `keydown`, `click`, `scroll` events
- Resets a countdown timer on each user interaction
- If no interaction for `timeoutMinutes` (default 5), calls `logout()`
- Only active when `isLoggedIn === true`
- Cleans up event listeners on unmount

---

### `sortTodos.ts` — Pure Sort Utility

```typescript
// src/utils/sortTodos.ts

export const sortTodos = (todos: TodoArray, sort: SortType): TodoArray => {
  const copy = [...todos];
  switch (sort) {
    case "date_desc":  return copy.sort((a, b) => b.created_at - a.created_at);
    case "date_asc":   return copy.sort((a, b) => a.created_at - b.created_at);
    case "alpha_asc":  return copy.sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: "base" }));
    case "alpha_desc": return copy.sort((a, b) => b.text.localeCompare(a.text, undefined, { sensitivity: "base" }));
    case "manual":
    default:           return copy.sort((a, b) => a.manual_index - b.manual_index);
  }
};

/** Recomputes sequential manual_index values after drag-and-drop. */
export const reindexManual = (todos: TodoArray): TodoArray =>
  todos.map((t, i) => ({ ...t, manual_index: i }));
```

**New in v1.5:** Added `reindexManual` helper function. Alpha sorting uses `localeCompare` with `sensitivity: "base"` for case-insensitive comparison.

---

## 8. Network Layer

### Architecture

The network layer follows a **three-tier pattern**:

```
Components / Store Actions
       ↓
  Service Layer (authService, todoService)
       ↓
  HTTP Client (Axios instance with interceptors)
       ↓
  Backendless REST API
```

---

### `backendless.ts` — Configuration

```typescript
// src/config/backendless.ts

export const APP_ID = import.meta.env.VITE_BACKENDLESS_APP_ID || "";
export const API_KEY = import.meta.env.VITE_BACKENDLESS_API_KEY || "";
export const BASE_URL = `https://api.backendless.com/${APP_ID}/${API_KEY}`;
```

Reads credentials from Vite environment variables (`.env` file). The `BASE_URL` is constructed as the Backendless API base path.

---

### `axios.ts` — HTTP Client

```typescript
// src/lib/axios.ts

const backendlessAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});
```

**Request Interceptor:** Automatically attaches the `user-token` header to every outgoing request by reading it from `useAuthStore.getState().userToken`.

**Response Interceptor:** Handles 401/403 responses globally:
- If the error occurs on a **non-auth endpoint** (not login/register): clears auth state and redirects to `/signin`
- If the error occurs on an **auth endpoint** (login/register): lets it propagate to the calling code for proper error display (e.g., "Invalid password")

---

### `authService.ts` — Auth API

| Method | HTTP | Endpoint | Description |
| --- | --- | --- | --- |
| `register(credentials)` | POST | `/users/register` | Creates a new user account. Sends `name`, `email`, `password` (excludes `confirmPassword`). |
| `login(credentials)` | POST | `/users/login` | Authenticates user. Sends `{ login: email, password }` (Backendless expects `login` not `email`). Returns `BackendlessUser` with `user-token`. |
| `logout()` | GET | `/users/logout` | Invalidates the current session on the server. |

---

### `todoService.ts` — Todo CRUD API

| Method | HTTP | Endpoint | Description |
| --- | --- | --- | --- |
| `fetchTodos(ownerId)` | GET | `/data/Todos?where=ownerId='...'` | Fetches all todos belonging to a specific user. |
| `createTodo(todo)` | POST | `/data/Todos` | Creates a new todo record in the database. |
| `updateTodo(objectId, updates)` | PUT | `/data/Todos/{objectId}` | Partially updates a todo (text, completed, manual_index). |
| `deleteTodo(objectId)` | DELETE | `/data/Todos/{objectId}` | Permanently deletes a single todo. |
| `bulkDelete(whereClause)` | DELETE | `/data/Todos?where=...` | Bulk deletes todos matching a condition (e.g., `"completed=true"`). |

---

## 9. Form Validation

### `authSchema.ts` — Yup Validation Schemas

#### Login Schema

```typescript
export const loginSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  password: Yup.string()
    .required('Password is required'),
});
```

#### Registration Schema (NIST-aligned password rules)

```typescript
export const registerSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});
```

### How Formik + Yup Work Together

```
User types in input
  → formik.handleChange updates form state
  → formik.handleBlur marks field as "touched"
  → Yup schema validates on change/blur
  → If validation fails → formik.errors[field] is populated
  → Error message renders below the input (only if touched + error)
  → On submit → formik.handleSubmit runs Yup validation
  → If valid → onSubmit callback fires → calls store action
  → If invalid → form shows all validation errors, submission blocked
```

---

## 10. Key Behaviors & Business Logic

### 10.1 Sort ↔ Drag-and-Drop Contract

| Trigger | Result |
| --- | --- |
| User selects **Manual** from sort dropdown | `sort = "manual"`, drag handles become visible and dragging is enabled |
| User selects any **other sort** (newest, oldest, a-z, z-a) | `sort = <selection>`, drag handles are hidden, `DndContext` disables sensors |
| User **drags and drops** a task | `reorderTodos()` uses `arrayMove` + `reindexManual`, sets `sort = "manual"`, syncs changed indices to backend |

**Reorder algorithm (v1.5):**
1. Sort todos by `manual_index` to get the current visual order
2. Use `arrayMove(sorted, oldIndex, newIndex)` from `@dnd-kit/sortable` to reposition the item
3. Call `reindexManual()` to assign sequential `0, 1, 2, ...` indices
4. Optimistically update local state
5. Identify only items whose `manual_index` actually changed
6. `Promise.all` → PUT each changed item's new `manual_index` to Backendless
7. On failure → revert to original order

---

### 10.2 Search + Filter Composition

Search and filter are always applied together. Neither resets the other. The pipeline is always: **Filter by status → Filter by search → Sort**.

```
todos (source)
  → filter(status)     [all | active | completed]
  → filter(searchInput) [substring match, case-insensitive]
  → sort(SortType)
  → rendered list
```

---

### 10.3 Inline Edit Flow (US-07, US-07b)

`TodoItem` manages a local `isEditing` boolean and `editValue` string (React `useState`) — these are not in the global store as they are purely transient UI state.

```
double-click text  →  isEditing = true, editValue = todo.text
press Enter        →  updateTodo(objectId, editValue.trim()), isEditing = false
press Escape       →  isEditing = false (revert, no store update)
input blur         →  same as Escape (cancel on blur for safety)
```

Validation: if `editValue.trim()` is empty on Enter, the edit is cancelled (revert to original text).

---

### 10.4 `manual_index` Assignment

- **On create:** `manual_index = todos.length` (new items always append to the bottom).
- **On delete:** No re-indexing needed. Sort by `manual_index` naturally handles gaps.
- **On drag:** Uses `arrayMove` for precise repositioning, then `reindexManual` computes clean `0, 1, 2, ...` indices. Only changed indices are synced to the server.

---

### 10.5 Persistence Scope

**localStorage** (via Zustand `persist` middleware):

| Field | Persisted |
| --- | --- |
| `isDarkMode` | ✅ Yes |
| `todos` | ✅ Yes (local cache) |
| `sort` | ✅ Yes |
| `filter` | ✅ Yes |
| `newInput` | ❌ No (transient) |
| `searchInput` | ❌ No (transient) |
| `isLoading` | ❌ No (transient) |
| `isSyncing` | ❌ No (transient) |
| `error` | ❌ No (transient) |
| `user` | ✅ Yes (auth store) |
| `userToken` | ✅ Yes (auth store) |
| `isLoggedIn` | ✅ Yes (auth store) |

**Backendless** (via REST API):

| Data | Stored In |
| --- | --- |
| User accounts | `Users` table |
| Todo items | `Todos` table (linked by `ownerId`) |

---

### 10.6 Optimistic UI Pattern (new in v1.5)

Every CRUD action follows this pattern:

```
User action (click, type, drag)
  → 1. Save current state snapshot (for rollback)
  → 2. Update UI immediately (set({ todos: ... }))
  → 3. Set isSyncing = true
  → 4. Call todoService API method
  → 5a. Success: set isSyncing = false (done!)
  → 5b. Failure: REVERT state to snapshot, set error message
```

**Why optimistic UI?** The user sees instant feedback. The network call happens in the background. If it fails, the UI silently reverts. This makes the app feel as fast as a local-only app while being server-backed.

---

### 10.7 Empty State Logic

`EmptyState` is rendered inside `TodoList` and receives a `reason` prop:

| Condition | `reason` | Message |
| --- | --- | --- |
| `todos.length === 0` | `"empty"` | "No tasks yet — add one above!" |
| `todos.length > 0` but filtered list is empty | `"no-result"` | "No tasks match your search." |

---

### 10.8 Mobile Responsive Design

The app uses Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) to adapt layout for mobile:

| Element | Mobile (< 640px) | Desktop (≥ 640px) |
| --- | --- | --- |
| **Auth pages** | Single column, fixed viewport, gradient banner at top, form below | Two-pane split layout (banner left, form right) |
| **TodoFooter** | Items count + Clear Completed only; filter tabs in separate `MobileFilterBar` card below | All three sections in one row (inline filter tabs) |
| **Drag handle** | Always visible (`opacity-100`) | Hidden, appears on hover (`sm:group-hover:opacity-100`) |
| **Delete button** | Always visible | Hidden, appears on hover (`group-hover:opacity-100`) |
| **Search row** | Smaller buttons (48×48px), tighter gap (8px), search height 48px | Larger buttons (64×64px), wider gap (16px), search height 64px |
| **Touch DnD** | Enabled via `TouchSensor` (delay 200ms) + `touch-action: none` on drag handle | Uses `PointerSensor` (distance 5px) |

---

### 10.9 Authentication Flow (redesigned in v1.5)

The app uses **protected routing** via React Router. The routing logic lives in `App.tsx`:

```
/signin  → If logged in → redirect to /
           If NOT logged in → show SignIn component

/signup  → If logged in → redirect to /
           If NOT logged in → show SignUp component

/        → If logged in → show TodoPage component
           If NOT logged in → redirect to /signin
```

**Sign Up flow:**
```
User opens /signup
  → Fills in name, email, password, confirmPassword
  → Formik validates using registerSchema (Yup)
  → Clicks "Sign Up"
  → signUp(name, email, password) calls authService.register()
  → If success: navigate("/signin", { state: { successMessage } })
  → SignIn page shows green success banner
```

**Sign In flow:**
```
User opens /signin
  → Fills in email, password
  → Formik validates using loginSchema (Yup)
  → Clicks "Sign In"
  → signIn(email, password) calls authService.login()
  → Stores BackendlessUser + user-token in auth store
  → useEffect detects isLoggedIn = true → navigate("/")
  → TodoPage mounts → fetchTodos(user.objectId) loads tasks
```

**Logout flow:**
```
User clicks burger menu → clicks "Sign out"
  → menuOpen = false (close overlay)
  → logout() calls authService.logout() to invalidate server session
  → Clears user, userToken, isLoggedIn in store
  → navigate("/signin", { replace: true })
```

**Auto-logout (idle timer):**
```
User stops interacting for 5 minutes
  → useIdleTimer timeout fires
  → logout() is called automatically
  → User is redirected to /signin
```

**Session persistence:** Auth state (`user`, `userToken`, `isLoggedIn`) is saved to localStorage under key `"auth-storage"`. On page refresh, Zustand's `persist` middleware rehydrates the store. The Axios request interceptor automatically attaches the `user-token` header.

---

### 10.10 Burger Menu Overlay Pattern

The overlay uses a **CSS-driven transition** approach rather than conditional rendering (mount/unmount). Both the backdrop and panel are always in the DOM.

**How it works:**

| State | Backdrop | Panel |
| --- | --- | --- |
| `menuOpen = false` | `opacity: 0`, `pointer-events: none` | `transform: translateX(100%)` (off-screen right) |
| `menuOpen = true` | `opacity: 1`, `pointer-events: auto` | `transform: translateX(0)` (on-screen) |

**Why CSS transitions instead of conditional rendering?**
- Mounting/unmounting with `{menuOpen && <Panel />}` would prevent the **closing animation** from playing (the element disappears immediately)
- With CSS transitions, the element stays in the DOM but is visually hidden and non-interactive (via `pointer-events: none`)
- The `transition` property handles smooth animation between states

**Glassmorphism design:**
- Light mode: semi-transparent purple gradient + `backdrop-filter: blur(24px)`
- Dark mode: nearly-opaque dark purple gradient (overridden via `.dark .menu-overlay-panel`)
- Panel has a `box-shadow` on the left side for depth

**Accessibility:**
- Panel has `role="dialog"` and `aria-label="User menu"`
- Close button has `aria-label="Close menu"`
- Burger button has `aria-label="Open menu"`
- Escape key closes the overlay
- Body scroll is locked while open to prevent background scrolling

---

### 10.11 Overlay CSS Architecture (index.css)

The overlay styles are defined in `index.css` using custom CSS classes (not Tailwind utilities) because the animation logic requires coordinating multiple properties across states:

| Class | Purpose |
| --- | --- |
| `.menu-overlay-backdrop` | Full-screen dark overlay, fades in/out via opacity |
| `.menu-overlay-backdrop.open` | Makes backdrop visible and clickable |
| `.menu-overlay-panel` | Right-anchored side panel, slides via translateX |
| `.menu-overlay-panel.open` | Slides panel into view |
| `.dark .menu-overlay-panel` | Dark mode gradient override |
| `.menu-overlay-close` | ✕ button with rotate-on-hover animation |
| `.menu-overlay-avatar` | Circular badge with purple gradient + glow shadow |
| `.menu-overlay-user-info` | Centered name + email text |
| `.menu-overlay-divider` | Subtle horizontal line |
| `.menu-overlay-logout` | Sign-out button with red hover tint + slide effect |

---

### 10.12 Axios Interceptor Pattern (new in v1.5)

**Request Interceptor — Token Injection:**
```
Every outgoing HTTP request
  → Interceptor reads userToken from useAuthStore.getState()
  → If token exists → attaches as 'user-token' header
  → Request proceeds with authentication
```

**Response Interceptor — Unauthorized Handling:**
```
HTTP response arrives
  → If 2xx → pass through (success)
  → If 401/403:
    → Check: is this a login/register endpoint?
    → If YES → let error propagate (show "Invalid password" to user)
    → If NO → session expired!
      → Clear auth state (user = null, token = null, isLoggedIn = false)
      → Hard redirect to /signin via window.location.href
```

**Why `window.location.href` instead of `navigate()`?**
The interceptor runs outside React's component tree, so React Router's `navigate()` is not available. A full page redirect with `window.location.href` forces a clean state reset.

---

_End of Documentation_
