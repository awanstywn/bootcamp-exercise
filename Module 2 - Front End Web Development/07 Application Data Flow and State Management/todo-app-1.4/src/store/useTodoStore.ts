/**
 * useTodoStore — Global state management with Zustand.
 *
 * Contains all app state (theme, todos, inputs, sort, filter) and actions.
 * State is persisted to localStorage via Zustand's `persist` middleware
 * (only stable state is saved; transient inputs like searchInput are not).
 */

import { create } from "zustand";           // create() builds a global store (like React context but simpler)
import { persist } from "zustand/middleware"; // persist() auto-saves state to localStorage
import { arrayMove } from "@dnd-kit/sortable"; // arrayMove(arr, from, to) moves an item in an array
import type { ThemeType, FilterType, SortType, Todo, TodoArray } from "../types/types";
import { reindexManual } from "../utils/sortTodos";
// ── Store Type ──────────────────────────────────────────
type TodoStore = {
  // ── State ──────────────────────────────────
  isDarkMode: ThemeType;     // US-01: boolean theme flag (true = dark)
  todos: TodoArray;
  newInput: string;          // Controlled value for the "add task" input
  searchInput: string;       // Controlled value for the search input
  sort: SortType;            // Active sort strategy (default: "manual")
  filter: FilterType;        // Active status filter (default: "all")

  // ── Theme Actions ───────────────────────────
  toggleTheme: () => void;   // US-01: flip isDarkMode boolean

  // ── Input Actions ───────────────────────────
  setNewInput: (value: string) => void;
  setSearchInput: (value: string) => void;

  // ── Sort & Filter Actions ───────────────────
  setSort: (sort: SortType) => void;     // US-04: change sort strategy
  setFilter: (filter: FilterType) => void; // US-11: change status filter

  // ── Todo CRUD Actions ───────────────────────
  addTodo: () => void;                            // US-02: create new task from newInput
  toggleTodo: (id: string) => void;               // US-06: flip completed boolean
  updateTodo: (id: string, text: string) => void; // US-07: save inline edit
  removeTodo: (id: string) => void;               // US-08: delete single task
  clearCompleted: () => void;                     // US-12: remove all completed tasks

  // ── Drag & Drop Action ──────────────────────
  /**
   * US-09 / US-04d: Called on DragEnd with active and over item IDs.
   * Uses @dnd-kit/sortable arrayMove to reorder, then reindexes manual_index.
   * Always sets sort = "manual" after a drag.
   */
  reorderTodos: (activeId: string, overId: string) => void;
};

// create<TodoStore>() creates the Zustand store
// persist() wraps it to auto-save/load from localStorage
// (set, get) are the two main tools:
//   set() = update state (triggers re-renders in all components using this state)
//   get() = read current state without subscribing to changes
const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ───────────────────────
      isDarkMode: true,    // Default to dark mode (matches design reference)
      todos: [],
      newInput: "",
      searchInput: "",
      sort: "manual",
      filter: "all",

      // toggleTheme flips isDarkMode: true ↔ false
      // set() with a function receives current state (s) and returns partial update
      toggleTheme: () =>
        set((s) => ({ isDarkMode: !s.isDarkMode })),

      // Simple setters: update a single field in the store
      // set({ key: value }) merges the new value into the existing state
      setNewInput: (value) => set({ newInput: value }),
      setSearchInput: (value) => set({ searchInput: value }),

      // ── Sort & Filter ────────────────────────
      setSort: (sort) => set({ sort }),
      setFilter: (filter) => set({ filter }),

      // ── Todo CRUD ────────────────────────────

      addTodo: () => {
        // get() reads current state (we need newInput and todos)
        const { newInput, todos } = get();
        const trimmed = newInput.trim();
        if (!trimmed) return; // Don't add empty tasks

        // Build a new Todo object with a unique ID and timestamp
        const newTodo: Todo = {
          id: crypto.randomUUID(),     // Generate unique ID (browser built-in)
          text: trimmed,
          completed: false,
          created_at: Date.now(),       // Unix timestamp in milliseconds
          manual_index: todos.length,   // Position at end of list
        };

        // Spread operator: [...todos, newTodo] = create new array with all old items + new one
        // Also clear the input field by setting newInput to ""
        set({ todos: [...todos, newTodo], newInput: "" });
      },

      // .map() creates a new array: flip the `completed` flag only for the matching todo
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t  // ...t = copy all fields, then override completed
          ),
        })),

      updateTodo: (id, text) => {
        const trimmed = text.trim();
        if (!trimmed) return; // Discard empty edits (revert handled in component)
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
        }));
      },

      // .filter() creates a new array excluding the deleted todo
      removeTodo: (id) =>
        set((s) => ({
          todos: s.todos.filter((t) => t.id !== id),
        })),

      // .filter() keeps only incomplete tasks (removes all completed ones)
      clearCompleted: () =>
        set((s) => ({
          todos: s.todos.filter((t) => !t.completed),
        })),

      // Drag & Drop reorder algorithm:
      // 1. Sort todos by manual_index to get the current visual order
      // 2. Find where the dragged item (active) and drop target (over) are
      // 3. Use arrayMove() to move the item from old position to new position
      // 4. Reindex all manual_index values to be sequential (0, 1, 2, ...)
      // 5. Merge the new indices back and force sort = "manual"
      reorderTodos: (activeId, overId) => {
        const { todos } = get();

        // Step 1: Sort by manual_index to get visual order
        const sortedTodos = todos
          .slice()  // .slice() creates a copy (never mutate original array)
          .sort((a, b) => a.manual_index - b.manual_index);

        // Step 2: Find indices of dragged and target items
        const oldIndex = sortedTodos.findIndex((t) => t.id === activeId);
        const newIndex = sortedTodos.findIndex((t) => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;

        // Step 3: Move item from oldIndex to newIndex in array
        const reordered = arrayMove(sortedTodos, oldIndex, newIndex);

        // Step 4: Reassign sequential manual_index values (0, 1, 2, ...)
        const reindexed = reindexManual(reordered);

        // Step 5: Merge new manual_index values back into the original todos array
        const updated = todos.map((t) => {
          const reindexedItem = reindexed.find((r) => r.id === t.id);
          return reindexedItem ?? t; // ?? = use reindexedItem, or original if not found
        });

        // Always reset sort to "manual" after drag (so the manual order is displayed)
        set({ todos: updated, sort: "manual" });
      },
    }),
    {
      name: "todo-app-storage", // Key used in browser's localStorage
      // partialize: only save these fields to localStorage
      // newInput and searchInput are NOT saved (they're temporary/transient)
      partialize: (s) => ({
        isDarkMode: s.isDarkMode,
        todos: s.todos,
        sort: s.sort,
        filter: s.filter,
      }),
    }
  )
);

export default useTodoStore;