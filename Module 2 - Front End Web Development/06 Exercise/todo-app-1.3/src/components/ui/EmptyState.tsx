import type { EmptyStateReason } from "../../types/types";

type EmptyStateProps = {
  /**
   * "empty"      → todos array is completely empty (no tasks created yet)
   * "no-results" → todos exist but current search/filter yields no matches
   */
  reason: EmptyStateReason;
};

/**
 * EmptyState — Shown inside TodoList when the filtered list is empty.
 * - "empty": no tasks exist → "No tasks yet — add one above!"
 * - "no-results": tasks exist but nothing matches search/filter → "No tasks match your search."
 */
const EmptyState = ({ reason }: EmptyStateProps) => {
  return (
    <div className="py-12 flex flex-col items-center gap-3 text-center select-none">
      {/* Icon */}
      <div className="text-gray-300 dark:text-gray-600">
        {reason === "empty" ? (
          // Clipboard icon for empty state
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
          </svg>
        ) : (
          // Search/magnifier icon for no-results state
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M8 11h6M11 8v6" />
          </svg>
        )}
      </div>

      {/* Message */}
      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
        {reason === "empty"
          ? "No tasks yet — add one above!"
          : "No tasks match your search."}
      </p>

      {/* Sub-message for no-results */}
      {reason === "no-results" && (
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Try a different search term or change the filter.
        </p>
      )}
    </div>
  );
};

export default EmptyState;