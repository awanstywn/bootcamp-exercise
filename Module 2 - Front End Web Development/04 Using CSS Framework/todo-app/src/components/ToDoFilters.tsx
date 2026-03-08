/**
 * ToDoFilters Component
 *
 * Purpose: Displays filter buttons and controls for the todo list
 *
 * Note: This component is not currently used in the main app.
 * The filtering logic is integrated directly in App.tsx.
 *
 * Props:
 *   - isDarkMode (boolean, optional): Current theme mode (default: true)
 *   - itemsLeft (number, optional): Count of active todos (default: 5)
 *   - filter (FilterType): Current active filter ("all", "active", or "completed")
 *   - onFilterChange (function): Callback when filter selection changes
 *   - onClearCompleted (function): Callback when clear completed button clicked
 *   - borderBottomLeftRadius (string, optional): CSS border radius value
 *   - borderBottomRightRadius (string, optional): CSS border radius value
 *   - borderTopLeftRadius (string, optional): CSS border radius value
 *   - borderTopRightRadius (string, optional): CSS border radius value
 *
 * Features:
 *   - Three filter buttons: All, Active, Completed
 *   - Shows count of remaining active todos
 *   - Clear Completed button to remove all done items
 *   - Desktop and mobile layouts
 */

type FilterType = "all" | "active" | "completed";

interface ToDoFiltersProps {
  isDarkMode?: boolean;
  itemsLeft?: number;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClearCompleted: () => void;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
}

import { useState } from "react";

export function ToDoFilters({
  isDarkMode = true,
  itemsLeft = 5,
  filter,
  onFilterChange,
  onClearCompleted,
  borderBottomLeftRadius = "0",
  borderBottomRightRadius = "0",
  borderTopLeftRadius = "0",
  borderTopRightRadius = "0",
}: ToDoFiltersProps) {
  // Track which filter button is hovered for styling
  const [hoveredFilter, setHoveredFilter] = useState<FilterType | null>(null);
  // Track if clear button is hovered
  const [hoveredClear, setHoveredClear] = useState(false);

  return (
    <>
      {/* Main filter bar - counter, filter buttons (desktop), and clear button */}
      <div
        className="todo-filter-bar"
        style={{
          width: "100%",
          minHeight: "64px",
          borderTopLeftRadius,
          borderTopRightRadius,
          borderBottomLeftRadius: "0",
          borderBottomRightRadius: "0",
          backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
          borderTop: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          borderLeft: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          borderRight: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          borderBottom: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Items Left Counter */}
        <span
          className="items-counter"
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "400",
            fontSize: "clamp(12px, 2.5vw, 14px)",
            lineHeight: "1.5",
            letterSpacing: "-0.19px",
            color: isDarkMode ? "#5B5E7E" : "#9495A5",
          }}
        >
          {itemsLeft} items left
        </span>

        {/* Filter Buttons - Desktop only */}
        <div
          className="desktop-filter-buttons"
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => onFilterChange("all")}
            onMouseEnter={() => setHoveredFilter("all")}
            onMouseLeave={() => setHoveredFilter(null)}
            style={{
              fontFamily: "Josefin Sans, sans-serif",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "-0.19px",
              color:
                filter === "all"
                  ? "#3A7CFD"
                  : hoveredFilter === "all"
                    ? isDarkMode
                      ? "#C8CBE7"
                      : "#494C6B"
                    : isDarkMode
                      ? "#5B5E7E"
                      : "#9495A5",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("active")}
            onMouseEnter={() => setHoveredFilter("active")}
            onMouseLeave={() => setHoveredFilter(null)}
            style={{
              fontFamily: "Josefin Sans, sans-serif",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "-0.19px",
              color:
                filter === "active"
                  ? "#3A7CFD"
                  : hoveredFilter === "active"
                    ? isDarkMode
                      ? "#C8CBE7"
                      : "#494C6B"
                    : isDarkMode
                      ? "#5B5E7E"
                      : "#9495A5",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Active
          </button>
          <button
            onClick={() => onFilterChange("completed")}
            onMouseEnter={() => setHoveredFilter("completed")}
            onMouseLeave={() => setHoveredFilter(null)}
            style={{
              fontFamily: "Josefin Sans, sans-serif",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "-0.19px",
              color:
                filter === "completed"
                  ? "#3A7CFD"
                  : hoveredFilter === "completed"
                    ? isDarkMode
                      ? "#C8CBE7"
                      : "#494C6B"
                    : isDarkMode
                      ? "#5B5E7E"
                      : "#9495A5",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Completed
          </button>
        </div>

        {/* Clear Completed Button */}
        <button
          className="clear-completed-btn"
          onClick={onClearCompleted}
          onMouseEnter={() => setHoveredClear(true)}
          onMouseLeave={() => setHoveredClear(false)}
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "400",
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "-0.19px",
            textAlign: "right",
            color: hoveredClear
              ? isDarkMode
                ? "#C8CBE7"
                : "#494C6B"
              : isDarkMode
                ? "#5B5E7E"
                : "#9495A5",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          Clear Completed
        </button>
      </div>

      {/* Filter Buttons Section - Mobile only */}
      <div
        className="todo-filter-buttons"
        style={{
          width: "100%",
          height: "48px",
          backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
          borderLeft: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          borderRight: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          borderBottomLeftRadius,
          borderBottomRightRadius,
          borderBottom: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
          borderTop: "none",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "12px 24px",
        }}
      >
        {/* Filter Buttons */}
        <button
          onClick={() => onFilterChange("all")}
          onMouseEnter={() => setHoveredFilter("all")}
          onMouseLeave={() => setHoveredFilter(null)}
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "700",
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "-0.19px",
            color:
              filter === "all"
                ? "#3A7CFD"
                : hoveredFilter === "all"
                  ? isDarkMode
                    ? "#C8CBE7"
                    : "#494C6B"
                  : isDarkMode
                    ? "#5B5E7E"
                    : "#9495A5",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange("active")}
          onMouseEnter={() => setHoveredFilter("active")}
          onMouseLeave={() => setHoveredFilter(null)}
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "700",
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "-0.19px",
            color:
              filter === "active"
                ? "#3A7CFD"
                : hoveredFilter === "active"
                  ? isDarkMode
                    ? "#C8CBE7"
                    : "#494C6B"
                  : isDarkMode
                    ? "#5B5E7E"
                    : "#9495A5",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          Active
        </button>
        <button
          onClick={() => onFilterChange("completed")}
          onMouseEnter={() => setHoveredFilter("completed")}
          onMouseLeave={() => setHoveredFilter(null)}
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "700",
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "-0.19px",
            color:
              filter === "completed"
                ? "#3A7CFD"
                : hoveredFilter === "completed"
                  ? isDarkMode
                    ? "#C8CBE7"
                    : "#494C6B"
                  : isDarkMode
                    ? "#5B5E7E"
                    : "#9495A5",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          Completed
        </button>
      </div>
    </>
  );
}
