/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: components/analytics/AnalyticsWidget.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   A dashboard component that visualizes user productivity data.
 *   Displays task counters, a completion progress bar, and a 7-day activity trend.
 *
 * RELATIONS:
 *   - pages/TodoPage.tsx    → Consumes and renders this widget.
 *   - types/types.ts        → Uses AnalyticsSummary for prop definitions.
 *
 * HOW IT WORKS:
 *   1. Receives 'data' prop from TodoPage (which fetches it from the backend).
 *   2. Summary: Renders three key counters (Total, Completed, Active).
 *   3. Progress Bar: Calculates width based on the completion_rate percentage.
 *   4. Daily Trend: Generates a dynamic mini bar chart using CSS heights based 
 *      on the ratio of created tasks per day.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { AnalyticsSummary } from '../../types/types';

interface Props {
  data: AnalyticsSummary;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AnalyticsWidget: React.FC<Props> = ({ data, onRefresh, isRefreshing }) => {
  const { summary, dailyTrend } = data;

  // Generate the last 7 days array to ensure empty days are still rendered
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const existingData = dailyTrend.find((t) => t.day === dayStr);
    return {
      day: dayStr,
      created: existingData ? existingData.created : 0,
      label: d.toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  const maxCreated = Math.max(1, ...last7Days.map(d => d.created));
  
  return (
    <div className="mt-4 rounded-xl bg-black/5 dark:bg-black/20 p-4 border border-gray-200 dark:border-white/5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          📊 Task Statistics
        </h2>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh Analytics"
            disabled={isRefreshing}
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {/* --- Key Metrics Summary --- */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{summary.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{summary.completed_count}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{summary.active_count}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
      </div>
      
      {/* --- Completion Progress Bar --- */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Completion Rate</span>
          <span>{summary.completion_rate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${summary.completion_rate}%` }}
          />
        </div>
      </div>
      
      {/* --- 7-Day Activity Trend (Mini Bar Chart) --- */}
      <div>
        <div className="text-xs text-gray-400 mb-2 mt-4">Last 7 Days Trend</div>
        <div className="flex items-end gap-1 h-12 mt-6">
          {last7Days.map((day) => (
            <div key={day.day} className="group relative flex-1 flex flex-col items-center gap-0.5">
              {/* Custom Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200">
                {day.label}: {day.created} tasks
              </div>
              <div
                className="w-full bg-blue-500 hover:bg-blue-400 rounded-sm transition-all duration-300 cursor-pointer"
                style={{ height: `${Math.max(4, (day.created / maxCreated) * 40)}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {last7Days.map((day) => (
            <div key={day.day} className="flex-1 text-center text-[10px] text-gray-400">
              {day.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
