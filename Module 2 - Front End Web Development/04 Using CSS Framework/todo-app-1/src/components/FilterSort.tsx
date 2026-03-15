//add props type definition for filter and sort buttons
//the props isDarkMode and the filter parameter to filter the todo list based on the status (completed or not completed) and the sort parameter to sort the todo list based on the created date or the title

import { useState } from "react";

type FilterSortProps = {
  isDarkMode: boolean;
  filter: "all" | "active" | "completed";
  sort: "oldest" | "newest";
  onFilterChange?: (filter: "all" | "active" | "completed") => void;
  onSortChange?: (sort: "oldest" | "newest") => void;
};

export function FilterSort({
  isDarkMode,
  filter,
  sort = "oldest",
  onFilterChange,
  onSortChange,
}: FilterSortProps) {
  // State for managing dropdown visibility
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Define colors based on theme
  const theme = {
    bg: isDarkMode ? "#25273D" : "#FFFFFF",
    border: isDarkMode ? "#393A5A" : "#E0E0E0",
    text: isDarkMode ? "#C8CBE7" : "#393A4B",
    hover: isDarkMode ? "#393A5A" : "#F5F5F5",
    shadow: isDarkMode
      ? "0px 35px 50px -15px rgba(0, 0, 0, 0.5)"
      : "0px 35px 50px -15px rgba(194, 195, 214, 0.5)",
  };

  const filterOptions = ["all", "active", "completed"] as const;
  const sortOptions = ["oldest", "newest"] as const;

  const handleFilterSelect = (
    selectedFilter: (typeof filterOptions)[number],
  ) => {
    onFilterChange?.(selectedFilter);
    setFilterOpen(false);
  };

  const handleSortSelect = (selectedSort: (typeof sortOptions)[number]) => {
    onSortChange?.(selectedSort);
    setSortOpen(false);
  };

  return (
    <div
      className="filter-sort"
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      {/* ========================================
          FILTER DROPDOWN
          ======================================== */}
      <div style={{ position: "relative" }}>
        <button
          className="filter-btn"
          onClick={() => setFilterOpen(!filterOpen)}
          style={{
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "500",
            transition: "all 0.3s ease",
            boxShadow: theme.shadow,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.hover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.bg;
          }}
        >
          Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>

        {/* Filter dropdown menu */}
        {filterOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              marginTop: "8px",
              backgroundColor: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: "6px",
              boxShadow: theme.shadow,
              zIndex: 10,
              minWidth: "150px",
              overflow: "hidden",
            }}
          >
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleFilterSelect(option)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor:
                    filter === option ? theme.hover : "transparent",
                  border: "none",
                  color: theme.text,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "Josefin Sans, sans-serif",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    theme.hover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    filter === option ? theme.hover : "transparent";
                }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================
          SORT DROPDOWN
          ======================================== */}
      <div style={{ position: "relative" }}>
        <button
          className="sort-btn"
          onClick={() => setSortOpen(!sortOpen)}
          style={{
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "500",
            transition: "all 0.3s ease",
            boxShadow: theme.shadow,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.hover;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.bg;
          }}
        >
          Sort: {sort === "oldest" ? "Oldest to Newest" : "Newest to Oldest"}
        </button>

        {/* Sort dropdown menu */}
        {sortOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              marginTop: "8px",
              backgroundColor: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: "6px",
              boxShadow: theme.shadow,
              zIndex: 10,
              minWidth: "180px",
              overflow: "hidden",
            }}
          >
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSortSelect(option)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor:
                    sort === option ? theme.hover : "transparent",
                  border: "none",
                  color: theme.text,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "Josefin Sans, sans-serif",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    theme.hover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    sort === option ? theme.hover : "transparent";
                }}
              >
                {option === "oldest" ? "Oldest to Newest" : "Newest to Oldest"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
