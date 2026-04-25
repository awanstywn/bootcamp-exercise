/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/share.service.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Service layer for the Share Link feature (short URLs).
 *   Handles generating unique short codes and resolving them back to todo IDs.
 *
 * RELATIONS:
 *   - routes/share.routes.ts → Used by route handlers
 *   - config/db.ts        → pool.query() to read/write to the 'share_links' table
 *   - config/env.ts       → BASE_URL to construct the full short URL
 *   - middleware/errorHandler.ts → Throws AppError if access is denied
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { ShareLink } from '../types/index.js';

// --- Private Utilities ---

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Internal helper to generate a random alphanumeric string.
 */
const generateCode = (length: number = 8): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
};

// --- Service Implementation ---

export const shareService = {
  /**
   * Create or retrieve a short code for a specific todo.
   */
  createShortCode: async (todoId: string, userId: string): Promise<{ shortUrl: string; short_code: string }> => {
    // Step 1: Verify this todo belongs to this user
    const todoCheck = await pool.query(
      'SELECT id FROM todos WHERE id = $1 AND user_id = $2',
      [todoId, userId]
    );
    if (todoCheck.rows.length === 0) {
      throw new AppError(403, 'FORBIDDEN', 'Todo not found or access denied');
    }

    // Step 2: Check if this todo already has a short code
    const existing = await pool.query(
      'SELECT short_code FROM share_links WHERE todo_id = $1',
      [todoId]
    );
    if (existing.rows.length > 0) {
      const code = existing.rows[0].short_code;
      return { shortUrl: `${env.BASE_URL}/s/${code}`, short_code: code };
    }

    // Step 3: Generate a unique code
    let code: string;
    let isUnique = false;
    do {
      code = generateCode(8);
      const check = await pool.query(
        'SELECT id FROM share_links WHERE short_code = $1',
        [code]
      );
      isUnique = check.rows.length === 0;
    } while (!isUnique);

    // Step 4: Insert into the database
    await pool.query(
      'INSERT INTO share_links (todo_id, short_code) VALUES ($1, $2) RETURNING *',
      [todoId, code]
    );

    return { shortUrl: `${env.BASE_URL}/s/${code}`, short_code: code };
  },

  /**
   * Resolve a short code back to a todo_id.
   */
  resolveCode: async (code: string): Promise<{ todo_id: string } | null> => {
    const result = await pool.query(
      `SELECT sl.todo_id, t.user_id
       FROM share_links sl
       INNER JOIN todos t ON sl.todo_id = t.id
       WHERE sl.short_code = $1`,
      [code]
    );

    if (result.rows.length === 0) return null;
    return { todo_id: result.rows[0].todo_id };
  },
};
