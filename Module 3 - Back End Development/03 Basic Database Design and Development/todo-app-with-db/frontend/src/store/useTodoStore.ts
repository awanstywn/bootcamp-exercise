/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: store/useTodoStore.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Global state manager for tasks, UI themes, and search/filter preferences.
 *   Uses Zustand for high-performance React state management without context providers.
 *
 * RELATIONS:
 *   - services/todoService.ts → Executes API calls for data synchronization.
 *   - types/types.ts         → Provides the TodoStore and Todo interfaces.
 *   - components/todo/*      → Primary consumers of the state and actions.
 *   - utils/sortTodos.ts     → Helper for calculating manual_index during reordering.
 *
 * HOW IT WORKS:
 *   1. Optimistic UI: Actions (add, toggle, remove) update the local state instantly
 *      to ensure a zero-latency user experience.
 *   2. Backend Sync: After local update, the store calls 'todoService' to persist
 *      changes to the PostgreSQL backend.
 *   3. Rollback: If the network request fails, the store reverts the local state
 *      to a previous snapshot and displays an error message.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";
import todoService from "../services/todoService";
import type { Todo, TodoStore } from "../types/types";
import { reindexManual } from "../utils/sortTodos";

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
      
      /** 
       * Resets the entire store to its initial state.
       * Used during logout to ensure no data leaks between sessions.
       */
      clearTodos: () => set({ 
        todos: [], 
        error: null, 
        isLoading: false, 
        isSyncing: false 
      }),

      /** 
       * Fetches the user's tasks from the backend.
       * The backend identifies the user automatically via the JWT token.
       */
      fetchTodos: async () => {
        set({ isLoading: true, error: null });
        try {
          const todos = await todoService.fetchTodos();
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

      /** 
       * Adds a new task.
       * Uses a temporary ID and optimistic insertion to show the item immediately.
       */
      addTodo: async () => {
        const { newInput, todos } = get();
        const trimmed = newInput.trim();
        if (!trimmed) return;

        const tempId = 'temp-' + Date.now();
        const optimisticTodo: Todo = {
          id: tempId,
          user_id: '',
          text: trimmed,
          completed: false,
          created_at: new Date().toISOString(),
          manual_index: todos.length,
        };

        const snapshot = todos;
        set({ todos: [...todos, optimisticTodo], newInput: '', isSyncing: true, error: null });

        try {
          const newTodo = await todoService.createTodo(trimmed);
          set(state => ({
            todos: state.todos.map(t => t.id === tempId ? newTodo : t),
            isSyncing: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to add task";
          set({ todos: snapshot, isSyncing: false, error: message });
        }
      },

      /** 
       * Toggles task completion.
       * Backend call happens in the background while UI updates instantly.
       */
      toggleTodo: async (id) => {
        const todoToToggle = get().todos.find(t => t.id === id);
        if (!todoToToggle) return;
        
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
          isSyncing: true,
          error: null
        }));

        try {
          await todoService.updateTodo(id, { completed: !todoToToggle.completed });
          set({ isSyncing: false });
        } catch (error) {
          set((s) => ({
            todos: s.todos.map((t) =>
              t.id === id ? { ...t, completed: todoToToggle.completed } : t
            ),
            error: error instanceof Error ? error.message : "Failed to toggle task",
            isSyncing: false
          }));
        }
      },

      /** 
       * Updates the text of a specific todo.
       * Reverts to old text if the backend sync fails.
       */
      updateTodo: async (id, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        
        const todoToUpdate = get().todos.find(t => t.id === id);
        if (!todoToUpdate) return;
        
        const oldText = todoToUpdate.text;

        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
          isSyncing: true,
          error: null
        }));
        
        try {
          await todoService.updateTodo(id, { text: trimmed });
          set({ isSyncing: false });
        } catch (error) {
          set((s) => ({
            todos: s.todos.map((t) => (t.id === id ? { ...t, text: oldText } : t)),
            error: error instanceof Error ? error.message : "Failed to update task",
            isSyncing: false
          }));
        }
      },

      /** 
       * Removes a todo.
       * If removal fails, the item is restored to its original position.
       */
      removeTodo: async (id) => {
        const todoToRemove = get().todos.find(t => t.id === id);
        if (!todoToRemove) return;
        
        set((s) => ({
          todos: s.todos.filter((t) => t.id !== id),
          isSyncing: true,
          error: null
        }));
        
        try {
          await todoService.deleteTodo(id);
          set({ isSyncing: false });
        } catch (error) {
          set((s) => ({
            todos: [...s.todos, todoToRemove].sort((a, b) => a.manual_index - b.manual_index),
            error: error instanceof Error ? error.message : "Failed to delete task",
            isSyncing: false
          }));
        }
      },

      /** 
       * Clears all tasks marked as completed.
       * Uses a bulk deletion endpoint on the backend.
       */
      clearCompleted: async () => {
        const todosToClear = get().todos.filter(t => t.completed);
        if (todosToClear.length === 0) return;
        
        set((s) => ({
          todos: s.todos.filter((t) => !t.completed),
          isSyncing: true,
          error: null
        }));
        
        try {
          await todoService.clearCompleted();
          set({ isSyncing: false });
        } catch (error) {
          set((s) => ({
            todos: [...s.todos, ...todosToClear].sort((a, b) => a.manual_index - b.manual_index),
            error: error instanceof Error ? error.message : "Failed to clear completed tasks",
            isSyncing: false
          }));
        }
      },

      /** 
       * Reorders tasks via Drag & Drop.
       * Recalculates manual_index for affected items and syncs via a transaction-based endpoint.
       */
      reorderTodos: async (activeId, overId) => {
        const { todos } = get();
        const sortedTodos = todos.slice().sort((a, b) => a.manual_index - b.manual_index);

        const oldIndex = sortedTodos.findIndex((t) => t.id === activeId);
        const newIndex = sortedTodos.findIndex((t) => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(sortedTodos, oldIndex, newIndex);
        const reindexed = reindexManual(reordered);

        const updated = todos.map((t) => {
          const reindexedItem = reindexed.find((r) => r.id === t.id);
          return reindexedItem ?? t;
        });

        set({ todos: updated, sort: "manual", isSyncing: true, error: null });

        try {
          const changedItems = reindexed.filter((item) => {
            const originalItem = todos.find(t => t.id === item.id);
            return originalItem && originalItem.manual_index !== item.manual_index;
          });
          
          if (changedItems.length > 0) {
            await todoService.reorderTodos(
              changedItems.map(item => ({ id: item.id, manual_index: item.manual_index }))
            );
          }
          
          set({ isSyncing: false });
        } catch (error) {
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
       * Configuration for local storage persistence.
       * Only essential data is saved; transient UI state is excluded.
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