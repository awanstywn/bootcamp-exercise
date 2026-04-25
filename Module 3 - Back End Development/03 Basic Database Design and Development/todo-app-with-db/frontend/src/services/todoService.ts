/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/todoService.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Frontend service layer for all Todo operations.
 *   Provides CRUD methods and additional features (clearCompleted, reorderTodos).
 *
 * RELATIONS:
 *   - lib/axios.ts            → HTTP client (automatically injects JWT)
 *   - store/useTodoStore.ts   → Calls all methods from here
 *   - types/types.ts          → Type definition for Todo
 *   - Backend:
 *     GET    /api/todos           → fetchTodos()
 *     POST   /api/todos           → createTodo()
 *     PUT    /api/todos/:id       → updateTodo()
 *     DELETE /api/todos/:id       → deleteTodo()
 *     DELETE /api/todos/completed → clearCompleted()
 *     PUT    /api/todos/reorder   → reorderTodos()
 *
 * CHANGES from v1.5:
 *   - fetchTodos() no longer requires ownerId (backend reads from JWT)
 *   - Added clearCompleted() and reorderTodos() (new endpoints)
 *   - URL: Backendless /data/todos → Express /api/todos
 * ═══════════════════════════════════════════════════════════════════════════
 */

import apiClient from '../lib/axios';
import type { Todo } from '../types/types';

const todoService = {
  /**
   * Fetch all todos belonging to the currently logged-in user.
   * Backend identifies the user from the JWT token (not a parameter).
   */
  fetchTodos: async (): Promise<Todo[]> => {
    const response = await apiClient.get('/api/todos');
    return response.data.todos;
  },

  /**
   * Create a new todo with the given text.
   * Backend automatically sets: user_id (from JWT), manual_index (next), created_at (NOW)
   */
  createTodo: async (text: string): Promise<Todo> => {
    const response = await apiClient.post('/api/todos', { text });
    return response.data.todo;
  },

  /**
   * Update a todo — can update text, completed status, or manual_index.
   * Uses Partial to allow sending 1, 2, or all 3 fields at once.
   */
  updateTodo: async (id: string, updates: Partial<Pick<Todo, 'text' | 'completed' | 'manual_index'>>): Promise<Todo> => {
    const response = await apiClient.put(`/api/todos/${id}`, updates);
    return response.data.todo;
  },

  /** Delete a single todo by its ID */
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/todos/${id}`);
  },

  /**
   * Remove all todos marked as completed (completed = true).
   * Returns the count of deleted todos for UI feedback.
   */
  clearCompleted: async (): Promise<number> => {
    const response = await apiClient.delete('/api/todos/completed');
    return response.data.deletedCount;
  },

  /**
   * Reorder — Bulk update manual_index after a drag-and-drop operation.
   * Sends an array of { id, manual_index } for each item that changed position.
   * Backend executes this within a SQL transaction (all-or-nothing).
   */
  reorderTodos: async (updates: Array<{ id: string; manual_index: number }>): Promise<void> => {
    await apiClient.put('/api/todos/reorder', { updates });
  },
};

export default todoService;
