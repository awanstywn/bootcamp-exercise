/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/shareService.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Frontend service layer for the Share Link feature.
 *   Provides methods to create a short link for a specific todo.
 *
 * RELATIONS:
 *   - lib/axios.ts    → HTTP client (automatically injects JWT)
 *   - types/types.ts  → Type definition for ShareLinkResponse
 *   - components/todo/TodoItem.tsx → Calls createShareLink() on share icon click
 *   - Backend: POST /api/share → shareService.createShortCode()
 *
 * HOW IT WORKS:
 *   1. TodoItem share button click → call createShareLink(todo.id)
 *   2. Backend creates/retrieves short code → returns shortUrl + short_code
 *   3. Frontend copies shortUrl to clipboard → displays feedback
 * ═══════════════════════════════════════════════════════════════════════════
 */

import apiClient from '../lib/axios';
import type { ShareLinkResponse } from '../types/types';

export const shareService = {
  /**
   * Create or retrieve a short link for a specific todo.
   * If the todo already has a short code, the backend returns the same one (anti-duplication).
   *
   * @param todo_id - UUID of the todo to share
   * @returns { shortUrl: "http://localhost:4000/s/ABC12345", short_code: "ABC12345" }
   */
  createShareLink: async (todo_id: string): Promise<ShareLinkResponse> => {
    const response = await apiClient.post('/api/share', { todo_id });
    return response.data;
  },
};
