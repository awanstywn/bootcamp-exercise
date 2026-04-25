/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/analyticsService.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Frontend service layer for Analytics features.
 *   Provides methods to fetch statistical data about the user's todos.
 *
 * RELATIONS:
 *   - lib/axios.ts    → HTTP client (automatically injects JWT)
 *   - types/types.ts  → Type definition for AnalyticsSummary
 *   - components/analytics/AnalyticsWidget.tsx → Displays the fetched data
 *   - Backend: GET /api/analytics → analyticsService.getSummary()
 *
 * HOW IT WORKS:
 *   TodoPage mount → useEffect → fetchAnalytics() → update state → render widget
 * ═══════════════════════════════════════════════════════════════════════════
 */

import apiClient from '../lib/axios';
import type { AnalyticsSummary } from '../types/types';

export const analyticsService = {
  /**
   * Fetch analytics summary for the logged-in user.
   * The backend executes 3 SQL queries in parallel (Promise.all).
   *
   * @returns {
   *   summary: { total, completed_count, active_count, completion_rate },
   *   dailyTrend: [{ day, created, completed_on_day }],
   *   busiestDays: [{ day, total_created }]
   * }
   */
  fetchAnalytics: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get('/api/analytics');
    return response.data;
  },
};
