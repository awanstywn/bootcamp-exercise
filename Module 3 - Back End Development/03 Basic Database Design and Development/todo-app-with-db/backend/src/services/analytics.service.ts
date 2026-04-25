/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/analytics.service.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Service for complex SQL data analysis.
 *   Calculates user todo statistics using aggregation (GROUP BY, HAVING).
 *
 * RELATIONS:
 *   - routes/analytics.routes.ts → Used by getSummary handler
 *   - config/db.ts          → pool.query()
 *   - Database Tables       → Reads from 'todos' table
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { pool } from '../config/db.js';
import { AnalyticsSummary } from '../types/index.js';

export const analyticsService = {
  /**
   * Get an overall summary of user activity.
   * Uses Promise.all to run multiple analysis queries in parallel for performance.
   */
  getSummary: async (userId: string): Promise<AnalyticsSummary> => {
    // Query 1: Basic counters and completion rate
    const summaryQuery = pool.query(
      `SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE completed = true)::int as completed_count,
        COUNT(*) FILTER (WHERE completed = false)::int as active_count,
        CASE 
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE completed = true)::float / COUNT(*)::float) * 100)
          ELSE 0 
        END as completion_rate
      FROM todos 
      WHERE user_id = $1`,
      [userId]
    );

    // Query 2: Daily trend (last 7 days)
    const trendQuery = pool.query(
      `SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as day,
        COUNT(*)::int as created,
        COUNT(*) FILTER (WHERE completed = true)::int as completed_on_day
      FROM todos
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC`,
      [userId]
    );

    // Query 3: Busiest days (Days with 3 or more todos created)
    const busyDaysQuery = pool.query(
      `SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as day,
        COUNT(*)::int as total_created
      FROM todos
      WHERE user_id = $1
      GROUP BY day
      HAVING COUNT(*) >= 3
      ORDER BY total_created DESC`,
      [userId]
    );

    // Execute all queries in parallel
    const [summaryRes, trendRes, busyRes] = await Promise.all([
      summaryQuery,
      trendQuery,
      busyDaysQuery,
    ]);

    return {
      summary: summaryRes.rows[0],
      dailyTrend: trendRes.rows,
      busiestDays: busyRes.rows,
    };
  },
};
