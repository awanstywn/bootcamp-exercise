import backendlessAPI from '../lib/axios';
import type { Todo, TodoArray } from '../types/types';

/**
 * Objective: Provides a centralized API for all Todo-related database operations.
 */
const todoService = {
  // 1. Fetch all todos for a specific user
  fetchTodos: async (ownerId: string): Promise<TodoArray> => {
    // We strictly use the nested `params` object so Axios automatically URL-encodes the query!
    const response = await backendlessAPI.get<TodoArray>('/data/Todos', {
      params: {
        where: `ownerId='${ownerId}'`
      }
    });
    return response.data;
  },

  // 2. Create a new todo
  createTodo: async (todo: Todo): Promise<Todo> => {
    const response = await backendlessAPI.post<Todo>('/data/Todos', todo);
    return response.data;
  },

  // 3. Update an existing todo (text, completion, or index)
  updateTodo: async (objectId: string, updates: Partial<Todo>): Promise<Todo> => {
    const response = await backendlessAPI.put<Todo>(`/data/Todos/${objectId}`, updates);
    return response.data;
  },

  // 4. Delete a single todo
  deleteTodo: async (objectId: string): Promise<void> => {
    await backendlessAPI.delete(`/data/Todos/${objectId}`);
  },

  // 5. Bulk delete (Example: Clear Completed)
  bulkDelete: async (whereClause: string): Promise<number> => {
    const response = await backendlessAPI.delete<{ deletionTime: number }>('/data/Todos', {
      params: {
        where: whereClause
      }
    });
    return response?.data?.deletionTime || 0;
  }
};

export default todoService;
