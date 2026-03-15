# 📋 Todo List App — Code Documentation

> **Version:** 1.3.0
> **Last Updated:** 2026-03-15
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
8. [Key Behaviors & Business Logic](#8-key-behaviors--business-logic)

---

## 1. Project Overview

A clean, responsive **To Do List** web application that allows users to manage their daily tasks effectively. The app supports full task lifecycle: create, read, update, delete. It includes advanced UX features such as real-time search, multi-strategy sorting (including manual drag-and-drop), status-based filtering, and a persistent light/dark theme toggle.

---

## 2. Tech Stack & Libraries

| Layer            | Technology                                                                | Purpose                                                  |
| ---------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| Language         | **TypeScript**                                                            | Type safety, better DX, fewer runtime errors             |
| Bundler          | **Vite**                                                                  | Fast dev server and optimized production builds          |
| UI Framework     | **React**                                                                 | Component-based UI with hooks                            |
| Styling          | **Tailwind CSS**                                                          | Utility-first CSS, fast responsive design                |
| State Management | **Zustand**                                                               | Lightweight global state without boilerplate             |
| Drag & Drop      | **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) | Accessible, performant drag-and-drop for task reordering |

### Installation

```bash
npm create vite@latest todo-app -- --template react-ts
cd todo-app
npm install
npm install zustand
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 3. Features & User Stories

### Feature List

| ID  | Feature            | Description                                                             |
| --- | ------------------ | ----------------------------------------------------------------------- |
| F1  | Theme Toggle       | Switch between light and dark mode, persisted to localStorage           |
| F2  | To Do List Display | Render the list of tasks with full interaction support                  |
| F3  | New To Do Input    | Input field to create new tasks                                         |
| F4  | Search Input       | Real-time text filter on task list                                      |
| F5  | Sort Control       | Sort tasks by date or alphabetically; Manual mode enables drag-and-drop |
| F6  | Filter Control     | Filter tasks by completion status (All / Active / Completed)            |
| F7  | Data Persistence   | Save all state to localStorage for cross-session continuity             |

---

### User Stories

#### F1 — Theme Toggle

| ID     | User Story                                                                                                             | Priority  |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| US-01  | As a user, I can toggle between **light and dark mode** using a toggle button so the app matches my visual preference. | Must Have |
| US-01b | As a user, my **theme preference is saved** to localStorage so it is restored the next time I open the app.            | Must Have |

---

#### F2 — To Do List Display

| ID     | User Story                                                                                                                                                                    | Priority  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-05  | As a user, I can **view all tasks** as a list with a checkbox and text label so I can see my tasks at a glance.                                                               | Must Have |
| US-06  | As a user, I can **check or uncheck a checkbox** to toggle a task's completion status (done / not done).                                                                      | Must Have |
| US-07  | As a user, I can **double-click a task's text** to edit it inline, then press **Enter** to save.                                                                              | Must Have |
| US-07b | As a user, I can press **Escape while editing** to cancel and revert to the original text.                                                                                    | Must Have |
| US-08  | As a user, I can **delete a task** by clicking a delete button so I can remove it permanently.                                                                                | Must Have |
| US-09  | As a user, I can **drag and drop tasks** to manually reorder them **only when Sort is set to "Manual"**. Applying any other sort option disables drag-and-drop automatically. | Must Have |
| US-10  | As a user, I can **see a counter** displaying the number of active (incomplete) tasks.                                                                                        | Must Have |
| US-12  | As a user, I can **clear all completed tasks** at once using a "Clear Completed" button.                                                                                      | Must Have |
| US-13  | As a user, **completed tasks are visually distinct** (strikethrough text, muted color) so I can differentiate done vs. pending tasks.                                         | Must Have |
| US-14  | As a user, I see an **empty state message** when no tasks exist or no results match my current search/filter.                                                                 | Must Have |

---

#### F3 — New To Do Input

| ID     | User Story                                                                                                                   | Priority  |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-02  | As a user, I can **type a new task** in the input field and press **Enter** (or click an Add button) to add it to the list.  | Must Have |
| US-02b | As a user, I **cannot submit an empty or whitespace-only task** — the input is validated before submission.                  | Must Have |
| US-02c | As a user, the **input field is cleared and re-focused** after successfully adding a task so I can quickly add the next one. | Must Have |

---

#### F4 — Search Input

| ID     | User Story                                                                                                             | Priority  |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| US-03  | As a user, I can **type in a search field** to filter the task list in real time so I can quickly find specific tasks. | Must Have |
| US-03b | As a user, I see a **"No results found"** message when my search query matches no tasks.                               | Must Have |
| US-03c | As a user, I can **clear the search** with an × button to instantly return to the full list.                           | Must Have |

---

#### F5 — Sort Control

| ID     | User Story                                                                                                                                       | Priority  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| US-04  | As a user, I can **sort tasks** using a dropdown with the following options: **Manual** (default), **Newest**, **Oldest**, **A → Z**, **Z → A**. | Must Have |
| US-04b | As a user, the **currently active sort option is visually highlighted** in the dropdown so I always know the current sort state.                 | Must Have |
| US-04c | When I **apply any sort other than Manual**, drag-and-drop reordering is **disabled** and the drag handle is hidden.                             | Must Have |
| US-04d | When I **drag and drop a task**, the sort automatically **switches back to "Manual"** mode, preserving my custom order.                          | Must Have |

> **Sort Conflict Resolution Rule:**
>
> - `sort === "manual"` → drag-and-drop is **enabled**; tasks are ordered by `manual_index`.
> - `sort !== "manual"` → drag-and-drop is **disabled**; tasks are ordered by the active sort algorithm.
> - Performing a drag-and-drop action always sets `sort` back to `"manual"`.

---

#### F6 — Filter Control

| ID     | User Story                                                                                                                        | Priority  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- | --------- |
| US-11  | As a user, I can **filter tasks by status** using a dropdown with options: **All** (default), **Active**, **Completed**.          | Must Have |
| US-11b | As a user, **search and filter work simultaneously** — e.g., searching "meeting" within "Active" tasks narrows results correctly. | Must Have |

---

#### F7 — Data Persistence

| ID    | User Story                                                                                              | Priority    |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------- |
| US-16 | As a user, my **tasks are saved to localStorage** so they persist after I close or refresh the browser. | Must Have   |
| US-17 | As a user, my **sort and filter preferences are saved** to localStorage and restored on next visit.     | Should Have |

---

## 4. File Structure

```
todo-app/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx           # Root layout wrapper (applies theme class)
│   │   │
│   │   ├── todo/
│   │   │   ├── TodoList.tsx           # DnD context + renders sorted/filtered list
│   │   │   ├── TodoItem.tsx           # Single task row (checkbox, text, edit, delete, drag)
│   │   │   ├── TodoInput.tsx          # New task input field
│   │   │   └── TodoFooter.tsx         # Active counter + Clear Completed + Filter tabs
│   │   │                              #   exports: TodoFooter (default), MobileFilterBar (named)
│   │   │
│   │   ├── ui/
│   │   │   ├── EmptyState.tsx         # Empty/no-results illustration + message
│   │   │   ├── SortDropDown.tsx       # Sort options dropdown content
│   │   │   └── FilterDropDown.tsx     # Filter options dropdown content
│   │   │
│   │   ├── Header.tsx                 # Header with title and theme toggle
│   │   └── Search.tsx                 # Search input + Sort/Filter icon buttons w/ dropdowns
│   │
│   ├── store/
│   │   └── useTodoStore.ts            # Zustand store (all state + actions)
│   │
│   ├── hooks/
│   │   ├── useFilteredTodos.ts        # Derived: apply search + filter + sort
│   │   └── useLocalStorage.ts         # Generic localStorage sync utility
│   │
│   ├── types/
│   │   └── types.ts                   # All shared TypeScript types
│   │
│   ├── utils/
│   │   └── sortTodos.ts               # Pure sort functions by SortType
│   │
│   ├── assets/
│   │   ├── dark-bg.png                # Dark theme banner background image
│   │   └── light-bg.png               # Light theme banner background image
│   │
│   ├── App.tsx                        # Root component (layout, banner, content)
│   ├── App.css                        # App-specific styles
│   ├── main.tsx                       # Vite entry point
│   └── index.css                      # Tailwind v4 imports + global reset
│
├── index.html
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 5. Components

### `AppShell.tsx`

Wraps the entire app. Reads `isDarkMode` from the store and applies `"dark"` or `"light"` class to the root `<div>`, enabling Tailwind's dark mode variant.

```
Props: none
Reads from store: isDarkMode
```

---

### `TodoInput.tsx`

Controlled input bound to `newInput` in the store. Submits on Enter key or Add button click. Validates that input is not empty/whitespace before calling `addTodo()`. Clears and re-focuses after submit.

```
Props: none
Store actions used: addTodo, setNewInput
Store state used: newInput
```

---

### `Header.tsx`

Displays the app title and a theme toggle button. The toggle calls `toggleTheme()` on click to switch between light and dark modes.

```
Props:
  isDarkMode: boolean
Store actions used: toggleTheme
```

---

### `Search.tsx`

Search row containing three elements side by side:

1. **Search input** — Controlled input bound to `searchInput`. Renders a clear (×) button when text is present. Updates store on every keystroke for real-time filtering.
2. **Sort button** — Icon button that opens a dropdown with `SortDropdown` options (Manual / Newest / Oldest / A→Z / Z→A).
3. **Filter button** — Icon button that opens a dropdown with `FilterDropdown` options (All / Active / Completed).

**Responsive:** On mobile, gap between elements is tighter (`gap-2`), icon buttons are 48×48px, and search input height matches buttons at 48px. On desktop (`sm+`), gap is 16px, buttons are 64×64px, and search input is `min-h-[64px]`.

```
Props: none
Store actions used: setSearchInput
Store state used: searchInput
Local state: isFilterOpen, isSortOpen (dropdown visibility)
Child components: SortDropdown, FilterDropdown
```

---

### `TodoList.tsx`

Core list component. Wraps items in `@dnd-kit`'s `DndContext` and `SortableContext`. Drag-and-drop is conditionally enabled based on `sort === "manual"`. Calls `reorderTodos()` on drag end, which also resets sort to `"manual"`. Renders `TodoItem` for each task from `useFilteredTodos()`.

```
Props: none
Hooks used: useFilteredTodos
Store actions used: reorderTodos
Store state used: sort, todos
DnD sensors:
  - PointerSensor  (desktop mouse — activationConstraint: distance 5px)
  - TouchSensor    (mobile touch — activationConstraint: delay 200ms, tolerance 5px)
  - KeyboardSensor (keyboard nav — sortableKeyboardCoordinates)
```

---

### `TodoItem.tsx`

Renders a single task row. Uses `useSortable` from `@dnd-kit/sortable` for drag handle. Drag handle is hidden when `sort !== "manual"`.

**Sub-states:**

- **View mode** (default): shows drag handle (if Manual sort), checkbox, text, delete button
- **Edit mode** (on double-click): shows inline text input, saves on Enter, cancels on Escape

**Responsive:**
- Drag handle: always visible on mobile (`opacity-100`), appears on hover on desktop (`sm:opacity-0 sm:group-hover:opacity-100`)
- Drag handle uses `touch-action: none` CSS to prevent browser scroll interception on mobile
- Delete button: always visible on mobile, appears on hover on desktop (`md:opacity-0 group-hover:opacity-100`)

```
Props:
  todo: Todo

Store actions used: toggleTodo, updateTodo, removeTodo
Store state used: sort (to conditionally show drag handle)
DnD: useSortable (disabled when sort !== "manual")
```

---

### `TodoFooter.tsx`

Exports two components and one internal helper:

#### `TodoFooter` (default export)

Renders inside the main todo card. Contains:

1. **Active counter** — `"{n} items left"`
2. **Filter tabs** (desktop only, `hidden sm:flex`) — All | Active | Completed via `FilterButtons`
3. **Clear Completed** — always visible; disabled (muted style) when no completed tasks exist, enabled when at least one task is completed

#### `MobileFilterBar` (named export)

Separate card rendered **outside** the main todo container, visible only on mobile (`sm:hidden`). Displays the All | Active | Completed filter tabs in their own rounded card with matching shadow and background. Height matches a todo item (`min-h-[64px]`).

#### `FilterButtons` (internal)

Shared button group used by both `TodoFooter` (desktop) and `MobileFilterBar` (mobile). Renders three styled buttons that call `setFilter()`. Active filter is highlighted in blue (`#3A7CFD`).

```
Props: none
Store actions used: setFilter, clearCompleted
Store state used: filter, todos (for derived counts)
```

---

### `EmptyState.tsx`

Displayed inside `TodoList` when the filtered/searched list is empty. Shows one of two messages:

- `"No tasks yet — add one above!"` when `todos` is empty
- `"No tasks match your search."` when search/filter yields no results

```
Props:
  reason: "empty" | "no-results"
```

---

### `useFilteredTodos.ts`

Custom hook. Returns the final display-ready array of todos. Applies in this order:

1. **Filter** by status (`all` / `active` / `completed`)
2. **Search** filter by `searchInput` (case-insensitive substring match on `text`)
3. **Sort** by active `SortType`

```typescript
// Usage
const filteredTodos = useFilteredTodos();
```

---

## 6. Data Structures

```typescript
// src/types/types.ts

/** App theme — isDarkMode: true = dark, false = light */
type ThemeType = boolean;

/** Completion status filter */
type FilterType = "all" | "active" | "completed";

/** Sort strategy (standardized naming) */
type SortType = "manual" | "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";

/** Single task entity */
type Todo = {
  id: string; // Unique identifier — use crypto.randomUUID()
  text: string; // Task label text
  completed: boolean; // true = done, false = active
  created_at: number; // Unix timestamp (Date.now()) for date-based sorting
  manual_index: number; // Zero-based position for manual drag-and-drop ordering
};

type TodoArray = Todo[];
```

---

## 7. State Management

The app uses a single **Zustand store** (`useTodoStore`) as the source of truth. There is no React Context — components import the store directly via the `useTodoStore` hook.

### Store shape

```typescript
// src/store/useTodoStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

type TodoStore = {
  // ── State ──────────────────────────────────────────
  isDarkMode: boolean;       // boolean theme flag (true = dark)
  todos: TodoArray;
  newInput: string;
  searchInput: string;
  sort: SortType;
  filter: FilterType;

  // ── Theme Actions ───────────────────────────────────
  toggleTheme: () => void;

  // ── Input Actions ───────────────────────────────────
  setNewInput: (value: string) => void;
  setSearchInput: (value: string) => void;

  // ── Sort & Filter Actions ───────────────────────────
  setSort: (sort: SortType) => void;
  setFilter: (filter: FilterType) => void;

  // ── Todo CRUD Actions ───────────────────────────────
  addTodo: () => void; // Uses newInput; validates non-empty
  toggleTodo: (id: string) => void; // Flips completed boolean
  updateTodo: (id: string, text: string) => void; // Inline edit save
  removeTodo: (id: string) => void; // Delete single task
  clearCompleted: () => void; // Remove all completed tasks

  // ── Drag & Drop Action ──────────────────────────────
  reorderTodos: (activeId: string, overId: string) => void;
  // Swaps manual_index values of the two items,
  // then sets sort = "manual" automatically.
};

const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      todos: [],
      newInput: "",
      searchInput: "",
      sort: "manual",
      filter: "all",

      toggleTheme: () =>
        set((s) => ({ isDarkMode: !s.isDarkMode })),

      setNewInput: (value) => set({ newInput: value }),
      setSearchInput: (value) => set({ searchInput: value }),

      setSort: (sort) => set({ sort }),
      setFilter: (filter) => set({ filter }),

      addTodo: () => {
        const { newInput, todos } = get();
        const trimmed = newInput.trim();
        if (!trimmed) return; // US-02b: reject empty input
        const newTodo: Todo = {
          id: crypto.randomUUID(),
          text: trimmed,
          completed: false,
          created_at: Date.now(),
          manual_index: todos.length, // append to end of manual order
        };
        set({ todos: [...todos, newTodo], newInput: "" });
      },

      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        })),

      updateTodo: (id, text) =>
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, text } : t)),
        })),

      removeTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      clearCompleted: () =>
        set((s) => ({ todos: s.todos.filter((t) => !t.completed) })),

      reorderTodos: (activeId, overId) => {
        const { todos } = get();
        const active = todos.find((t) => t.id === activeId);
        const over = todos.find((t) => t.id === overId);
        if (!active || !over) return;

        // Swap manual_index values between the two dragged items
        const updatedTodos = todos.map((t) => {
          if (t.id === activeId)
            return { ...t, manual_index: over.manual_index };
          if (t.id === overId)
            return { ...t, manual_index: active.manual_index };
          return t;
        });

        set({ todos: updatedTodos, sort: "manual" }); // US-04d: always reset to manual
      },
    }),
    {
      name: "todo-app-storage", // localStorage key
      partialize: (s) => ({
        // Only persist these fields (not transient inputs)
        isDarkMode: s.isDarkMode,
        todos: s.todos,
        sort: s.sort,
        filter: s.filter,
      }),
    },
  ),
);

export default useTodoStore;
```

---

### `useFilteredTodos.ts` — Derived State Hook

```typescript
// src/hooks/useFilteredTodos.ts

import useTodoStore from "../store/useTodoStore";
import { sortTodos } from "../utils/sortTodos";

export const useFilteredTodos = (): Todo[] => {
  const { todos, searchInput, filter, sort } = useTodoStore();

  // Step 1: Filter by status
  const byStatus = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true; // "all"
  });

  // Step 2: Filter by search query (case-insensitive)
  const bySearch = byStatus.filter((t) =>
    t.text.toLowerCase().includes(searchInput.toLowerCase().trim()),
  );

  // Step 3: Sort
  return sortTodos(bySearch, sort);
};
```

---

### `sortTodos.ts` — Pure Sort Utility

```typescript
// src/utils/sortTodos.ts

export const sortTodos = (todos: TodoArray, sort: SortType): TodoArray => {
  const copy = [...todos];
  switch (sort) {
    case "date_desc":
      return copy.sort((a, b) => b.created_at - a.created_at);
    case "date_asc":
      return copy.sort((a, b) => a.created_at - b.created_at);
    case "alpha_asc":
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    case "alpha_desc":
      return copy.sort((a, b) => b.text.localeCompare(a.text));
    case "manual":
    default:
      return copy.sort((a, b) => a.manual_index - b.manual_index);
  }
};
```

---

## 8. Key Behaviors & Business Logic

### 8.1 Sort ↔ Drag-and-Drop Contract

This is the most nuanced interaction in the app. The following rules are enforced strictly:

| Trigger                                                    | Result                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| User selects **Manual** from sort dropdown                 | `sort = "manual"`, drag handles become visible and dragging is enabled             |
| User selects any **other sort** (newest, oldest, a-z, z-a) | `sort = <selection>`, drag handles are hidden, `DndContext` disables sensors       |
| User **drags and drops** a task                            | `reorderTodos()` swaps `manual_index` values, then forcibly sets `sort = "manual"` |

**In `TodoList.tsx`**, three sensors are registered and conditionally activated:

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 }, // prevent accidental drags on click
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 }, // mobile: press-and-hold to drag
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates, // accessible keyboard DnD
  })
);

// Disable DnD entirely when sort !== "manual"
const isDndEnabled = sort === "manual";

return (
  <DndContext
    sensors={isDndEnabled ? sensors : []} // pass empty sensors to disable
    onDragEnd={handleDragEnd}
  >
    <SortableContext items={filteredTodos.map((t) => t.id)}>
      {/* ... */}
    </SortableContext>
  </DndContext>
);
```

---

### 8.2 Search + Filter Composition

Search and filter are always applied together. Neither resets the other. The pipeline is always: **Filter by status → Filter by search → Sort**.

```
todos (source)
  → filter(status)     [all | active | completed]
  → filter(searchInput) [substring match, case-insensitive]
  → sort(SortType)
  → rendered list
```

---

### 8.3 Inline Edit Flow (US-07, US-07b)

`TodoItem` manages a local `isEditing` boolean and `editValue` string (React `useState`) — these are not in the global store as they are purely transient UI state.

```
double-click text  →  isEditing = true, editValue = todo.text
press Enter        →  updateTodo(id, editValue.trim()), isEditing = false
press Escape       →  isEditing = false (revert, no store update)
input blur         →  same as Escape (cancel on blur for safety)
```

Validation: if `editValue.trim()` is empty on Enter, the edit is cancelled (revert to original text).

---

### 8.4 `manual_index` Assignment

- **On create:** `manual_index = todos.length` (new items always append to the bottom).
- **On delete:** No re-indexing needed. Sort by `manual_index` naturally handles gaps.
- **On drag:** Only the two swapped items' `manual_index` values are exchanged. This is an O(n) pass over the array and is safe for the scale of a personal todo app.

---

### 8.5 Persistence Scope

Only these fields are persisted to `localStorage` via Zustand's `persist` middleware:

| Field         | Persisted         |
| ------------- | ----------------- |
| `isDarkMode`  | ✅ Yes            |
| `todos`       | ✅ Yes            |
| `sort`        | ✅ Yes            |
| `filter`      | ✅ Yes            |
| `newInput`    | ❌ No (transient) |
| `searchInput` | ❌ No (transient) |

---

### 8.6 Empty State Logic

`EmptyState` is rendered inside `TodoList` and receives a `reason` prop:

| Condition                                     | `reason`       | Message                         |
| --------------------------------------------- | -------------- | ------------------------------- |
| `todos.length === 0`                          | `"empty"`      | "No tasks yet — add one above!" |
| `todos.length > 0` but filtered list is empty | `"no-results"` | "No tasks match your search."   |

---

### 8.7 Mobile Responsive Design

The app uses Tailwind CSS responsive prefixes (`sm:`, `md:`) to adapt layout for mobile:

| Element | Mobile (< 640px) | Desktop (≥ 640px) |
| --- | --- | --- |
| **TodoFooter** | Items count + Clear Completed only; filter tabs in separate `MobileFilterBar` card below | All three sections in one row (inline filter tabs) |
| **Drag handle** | Always visible (`opacity-100`) | Hidden, appears on hover (`sm:group-hover:opacity-100`) |
| **Delete button** | Always visible | Hidden, appears on hover (`group-hover:opacity-100`) |
| **Search row** | Smaller buttons (48×48px), tighter gap (8px), search height 48px | Larger buttons (64×64px), wider gap (16px), search height 64px |
| **Touch DnD** | Enabled via `TouchSensor` (delay 200ms) + `touch-action: none` on drag handle | Uses `PointerSensor` (distance 5px) |

---

_End of Documentation_
