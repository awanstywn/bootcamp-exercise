/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: types/index.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Centralized type definitions for the backend.
 *   Provides interfaces for database models and service responses.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// --- Database Models ---

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at?: Date;
}

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  manual_index: number;
  created_at: Date;
}

export interface ShareLink {
  id: string;
  todo_id: string;
  short_code: string;
  created_at: Date;
}

// --- Service Responses ---

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface AnalyticsSummary {
  summary: {
    total: number;
    completed_count: number;
    active_count: number;
    completion_rate: number;
  };
  dailyTrend: Array<{
    day: string;
    created: number;
    completed_on_day: number;
  }>;
  busiestDays: Array<{
    day: string;
    total_created: number;
  }>;
}
