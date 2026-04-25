/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/todo.service.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Service layer for all Todo CRUD and logic operations.
 *   Contains raw SQL queries for filtering, searching, and bulk updates.
 *
 * RELATIONS:
 *   - routes/todo.routes.ts → Methods used by route handlers
 *   - config/db.ts     → pool.query() to execute PostgreSQL operations
 *   - middleware/errorHandler.ts → Throws AppError for Not Found or Validation issues
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { pool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { Todo } from '../types/index.js';

export const todoService = {
  /**
   * Fetch all todos belonging to a specific user.
   */
  getAllByUser: async (userId: string): Promise<Todo[]> => {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY manual_index ASC',
      [userId]
    );
    return result.rows;
  },

  /**
   * Fetch a single todo by ID for public sharing.
   */
  getShared: async (id: string): Promise<Todo> => {
    const result = await pool.query(
      'SELECT id, text, completed, created_at FROM todos WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Todo not found');
    return result.rows[0];
  },

  /**
   * Search todos by text matching (ILIKE).
   */
  searchByText: async (userId: string, query: string): Promise<{ todos: Todo[]; count: number }> => {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 AND text ILIKE $2 ORDER BY manual_index ASC',
      [userId, `%${query}%`]
    );
    return {
      todos: result.rows,
      count: result.rows.length,
    };
  },

  /**
   * Filter todos by completion status.
   */
  filterByStatus: async (userId: string, status: string): Promise<Todo[]> => {
    let sql = 'SELECT * FROM todos WHERE user_id = $1';
    const params: any[] = [userId];

    if (status === 'active') sql += ' AND completed = false';
    else if (status === 'completed') sql += ' AND completed = true';

    sql += ' ORDER BY manual_index ASC';

    const result = await pool.query(sql, params);
    return result.rows;
  },

  /**
   * Search todos using PostgreSQL regex operator (~).
   */
  searchByRegex: async (userId: string, pattern: string): Promise<Todo[]> => {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 AND text ~ $2 ORDER BY manual_index ASC',
      [userId, pattern]
    );
    return result.rows;
  },

  /**
   * Create a new todo.
   */
  create: async (userId: string, text: string): Promise<Todo> => {
    const result = await pool.query(
      'INSERT INTO todos (user_id, text) VALUES ($1, $2) RETURNING *',
      [userId, text]
    );
    return result.rows[0];
  },

  /**
   * Update an existing todo.
   */
  update: async (id: string, userId: string, updates: Partial<Todo>): Promise<Todo> => {
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      const current = await pool.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
      if (current.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Todo not found');
      return current.rows[0];
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');
    const values = Object.values(updates);

    const result = await pool.query(
      `UPDATE todos SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId, ...values]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Todo not found or access denied');
    }

    return result.rows[0];
  },

  /**
   * Delete a single todo.
   */
  remove: async (id: string, userId: string): Promise<void> => {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Todo not found or access denied');
    }
  },

  /**
   * Delete all completed todos for a user.
   */
  clearCompleted: async (userId: string): Promise<{ deletedCount: number }> => {
    const result = await pool.query(
      'DELETE FROM todos WHERE user_id = $1 AND completed = true',
      [userId]
    );
    return { deletedCount: result.rowCount || 0 };
  },

  /**
   * Reorder todos bulk (Database Transaction).
   */
  reorder: async (userId: string, updates: Array<{ id: string; manual_index: number }>): Promise<void> => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const update of updates) {
        await client.query(
          'UPDATE todos SET manual_index = $1 WHERE id = $2 AND user_id = $3',
          [update.manual_index, update.id, userId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
