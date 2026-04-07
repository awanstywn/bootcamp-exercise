/**
 * Objective: Global state management for tasks, UI themes, and search/filter inputs.
 * Uses Zustand for fast, centralized React global state without Provider wrapping.
 * Implements "Optimistic UI" updates: UI updates instantly on user action, then 
 * syncs to Backendless via `todoService`. Rolls back on network failure.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";
import todoService from "../services/todoService";
import type { Todo, TodoStore } from "../types/types";
import { reindexManual } from "../utils/sortTodos";

/**
 * Zustand Store Configuration
 * - `create<TodoStore>()`: Initializes the typed global store.
 * - `persist(...)`: Middleware that auto-saves targeted state to `localStorage`.
 * - `set`: Function to partially update store state (triggers components re-renders).
 * - `get`: Function to read current store state non-reactively.
 */
const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      // --- Initialization ---
      isDarkMode: true,
      todos: [],
      newInput: "",
      searchInput: "",
      sort: "manual",
      filter: "all",
      isLoading: false,
      isSyncing: false,
      error: null,
      
      /** Resets store data to initial empty state locally. */
      clearTodos: () => set({ todos: [], error: null, isLoading: false, isSyncing: false }),

      /** Fetches initial user tasks from the backend and populates the store. */
      fetchTodos: async (ownerId) => {
        set({ isLoading: true, error: null });
        try {
          const todos = await todoService.fetchTodos(ownerId);
          set({ todos, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch tasks";
          set({ error: message, isLoading: false });
        }
      },

      // --- UI & Local Actions ---
      toggleTheme: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setNewInput: (value) => set({ newInput: value }),
      setSearchInput: (value) => set({ searchInput: value }),
      setSort: (sort) => set({ sort }),
      setFilter: (filter) => set({ filter }),

      // --- Asynchronous CRUD Actions (Optimistic UI) ---

      /** Creates a new task object, saves it instantly to local state, then posts to backend. */
      addTodo: async () => {
        const { newInput, todos } = get();
        const trimmed = newInput.trim();
        if (!trimmed) return;
        
        // Dynamically import or getState to avoid circular dependencies if needed, 
        // but we'll safely use useAuthStore directly here.
        const useAuthStore = (await import('./useAuthStore')).default;
        const currentUserId = useAuthStore.getState().user?.objectId;

        set({ isSyncing: true, error: null });

        try {
          const newTodoData = {
            text: trimmed,
            completed: false,
            created_at: Date.now(),
            manual_index: todos.length,
            ownerId: currentUserId, // Explicitly assign ownerId to ensure Backendless records it!
          };
          
          const createdTodo = await todoService.createTodo(newTodoData as Todo);
          
          set({ 
            todos: [...get().todos, createdTodo], 
            newInput: "", 
            isSyncing: false 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to add task";
          set({ error: message, isSyncing: false });
        }
      },

      /** Toggles completion status instantly on UI, then patches backend. Reverts if patch fails. */
      toggleTodo: async (objectId) => {
        const todoToToggle = get().todos.find(t => t.objectId === objectId);
        if (!todoToToggle) return;
        
        // Optimistic update
        set((s) => ({
          todos: s.todos.map((t) =>
            t.objectId === objectId ? { ...t, completed: !t.completed } : t
          ),
          isSyncing: true,
          error: null
        }));

        try {
          await todoService.updateTodo(objectId, { completed: !todoToToggle.completed });
          set({ isSyncing: false });
        } catch (error) {
          // Revert update
          set((s) => ({
            todos: s.todos.map((t) =>
              t.objectId === objectId ? { ...t, completed: todoToToggle.completed } : t
            ),
            error: error instanceof Error ? error.message : "Failed to toggle task",
            isSyncing: false
          }));
        }
      },

      /** Saves edited text instantly on UI, then patches backend. Reverts to old text on failure. */
      updateTodo: async (objectId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        
        const todoToUpdate = get().todos.find(t => t.objectId === objectId);
        if (!todoToUpdate) return;
        
        const oldText = todoToUpdate.text;

        // Optimistic update
        set((s) => ({
          todos: s.todos.map((t) => (t.objectId === objectId ? { ...t, text: trimmed } : t)),
          isSyncing: true,
          error: null
        }));
        
        try {
          await todoService.updateTodo(objectId, { text: trimmed });
          set({ isSyncing: false });
        } catch (error) {
          // Revert update
          set((s) => ({
            todos: s.todos.map((t) => (t.objectId === objectId ? { ...t, text: oldText } : t)),
            error: error instanceof Error ? error.message : "Failed to update task",
            isSyncing: false
          }));
        }
      },

      /** Deletes target task from local UI immediately, then fires backend deletion. Reverts on failure. */
      removeTodo: async (objectId) => {
        const todoToRemove = get().todos.find(t => t.objectId === objectId);
        if (!todoToRemove) return;
        
        // Optimistic removal
        set((s) => ({
          todos: s.todos.filter((t) => t.objectId !== objectId),
          isSyncing: true,
          error: null
        }));
        
        try {
          await todoService.deleteTodo(objectId);
          set({ isSyncing: false });
        } catch (error) {
          // Revert removal
          set((s) => ({
            todos: [...s.todos, todoToRemove].sort((a, b) => a.manual_index - b.manual_index),
            error: error instanceof Error ? error.message : "Failed to delete task",
            isSyncing: false
          }));
        }
      },

      /** Clears all completed tasks from UI instantly, then executes bulk deletion in backend. Reverts on failure. */
      clearCompleted: async () => {
        const todosToClear = get().todos.filter(t => t.completed);
        if (todosToClear.length === 0) return;
        
        // Optimistic bulk removal
        set((s) => ({
          todos: s.todos.filter((t) => !t.completed),
          isSyncing: true,
          error: null
        }));
        
        try {
          await todoService.bulkDelete("completed=true");
          set({ isSyncing: false });
        } catch (error) {
          // Revert removal
          set((s) => ({
            todos: [...s.todos, ...todosToClear].sort((a, b) => a.manual_index - b.manual_index),
            error: error instanceof Error ? error.message : "Failed to clear completed tasks",
            isSyncing: false
          }));
        }
      },

      /** 
       * Reorders tasks visually via drag & drop.
       * Computes precise elements whose manual index changed and syncs them back iteratively via Promise.all.
       */
      reorderTodos: async (activeId, overId) => {
        const { todos } = get();

        const sortedTodos = todos.slice().sort((a, b) => a.manual_index - b.manual_index);

        const oldIndex = sortedTodos.findIndex((t) => t.objectId === activeId);
        const newIndex = sortedTodos.findIndex((t) => t.objectId === overId);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(sortedTodos, oldIndex, newIndex);
        const reindexed = reindexManual(reordered);

        const updated = todos.map((t) => {
          const reindexedItem = reindexed.find((r) => r.objectId === t.objectId);
          return reindexedItem ?? t;
        });

        // Optimistic sort
        set({ todos: updated, sort: "manual", isSyncing: true, error: null });

        try {
          // Identify only elements whose manual_index actually changed
          const changedItems = reindexed.filter((item) => {
            const originalItem = todos.find(t => t.objectId === item.objectId);
            return originalItem && originalItem.manual_index !== item.manual_index;
          });
          
          await Promise.all(
            changedItems.map(item => {
              if (item.objectId) {
                return todoService.updateTodo(item.objectId, { manual_index: item.manual_index });
              }
              return Promise.resolve();
            })
          );
          
          set({ isSyncing: false });
        } catch (error) {
          // Revert sort
          set({ 
            todos: todos, 
            sort: "manual", 
            error: error instanceof Error ? error.message : "Failed to sync new order", 
            isSyncing: false 
          });
        }
      },
    }),
    {
      name: "todo-app-storage",
      /**
       * explicitly filter which state properties persist in localStorage.
       * Transient variables (like search bar text or loading statuses) are omitted.
       */
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