/**
 * ========================================
 * TODO FILTERS COMPONENT
 * ========================================
 *
 * Purpose: Displays filter buttons and controls for the todo list
 *
 * Note: This component is currently NOT USED in the application.
 *       The filtering functionality is integrated directly into App.tsx.
 *       This file exists as a reference implementation.
 *
 * Props:
 *   - isDarkMode: Current theme state (default: true)
 *   - itemsLeft: Number of active (uncompleted) todos (default: 5)
 *   - filter: Current filter type ("all" | "active" | "completed")
 *   - onFilterChange: Callback function when user selects a different filter
 *   - onClearCompleted: Callback function when user clicks "Clear Completed"
 *   - borderBottomLeftRadius: Bottom-left border radius (for styling)
 *   - borderBottomRightRadius: Bottom-right border radius (for styling)
 *   - borderTopLeftRadius: Top-left border radius (for styling)
 *   - borderTopRightRadius: Top-right border radius (for styling)
 *
 * Features:
 *   - Filter buttons: All, Active, Completed
 *   - Items left counter: Shows number of uncompleted todos
 *   - Clear completed button: Removes all completed todos
 *   - Hover effects on all buttons
 *   - Responsive layout with desktop and mobile variants
 *   - Color-coded active filter state (blue highlight)
 *
 * State:
 *   - hoveredFilter: Tracks which filter button is being hovered
 *   - hoveredClear: Tracks whether "Clear Completed" button is hovered
 *
 * Type Definitions:
 *   - FilterType: Union type defining the three filter options
 */

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * FilterType - Union Type
 *
 * A union type allows a variable to be one of several specific string values.
 * This is more type-safe than using a generic string type because:
 *   - TypeScript will only allow these three exact values
 *   - Typos are caught at compile time, not runtime
 *   - IDE autocomplete will suggest these options
 *
 * Usage example:
 *   const currentFilter: FilterType = "all";      // ✅ Valid
 *   const currentFilter: FilterType = "invalid";  // ❌ Type error
 *
 * This pattern is called a "string literal union type" and is commonly
 * used for enums-like behavior without using TypeScript's enum keyword.
 */
type FilterType = "all" | "active" | "completed";

/**
 * Interface defining the props that ToDoFilters component accepts
 *
 * The border radius props allow this component to be flexible in different
 * contexts - it can have rounded corners on any side depending on where
 * it's placed in the UI.
 */
interface ToDoFiltersProps {
  isDarkMode?: boolean;                        // Theme state (optional, defaults to true)
  itemsLeft?: number;                          // Number of uncompleted todos (optional, defaults to 5)
  filter: FilterType;                          // Currently active filter (required)
  onFilterChange: (filter: FilterType) => void; // Function to change filter (required)
  onClearCompleted: () => void;                // Function to clear completed items (required)
  borderBottomLeftRadius?: string;             // Border radius for bottom-left corner
  borderBottomRightRadius?: string;            // Border radius for bottom-right corner
  borderTopLeftRadius?: string;                // Border radius for top-left corner
  borderTopRightRadius?: string;               // Border radius for top-right corner
}

// ========================================
// IMPORTS
// ========================================

// React hooks
import { useState } from "react";

// ========================================
// COMPONENT
// ========================================

export function ToDoFilters({
  isDarkMode = true,                    // Default to dark mode
  itemsLeft = 5,                        // Default to showing 5 items left
  filter,                              // Current filter selection
  onFilterChange,                      // Callback for filter changes
  onClearCompleted,                    // Callback for clearing completed
  borderBottomLeftRadius = "0",        // Default to no border radius
  borderBottomRightRadius = "0",       // Default to no border radius
  borderTopLeftRadius = "0",           // Default to no border radius
  borderTopRightRadius = "0",          // Default to no border radius
}: ToDoFiltersProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  /**
   * useState Hook: Track hover state for filter buttons
   *
   * hoveredFilter can be:
   *   - null: No filter button is being hovered
   *   - "all": The "All" button is being hovered
   *   - "active": The "Active" button is being hovered
   *   - "completed": The "Completed" button is being hovered
   *
   * The type annotation <FilterType | null> is a union type that includes
   * the FilterType values plus null (representing no hover).
   *
   * This state is used to change button colors on hover, providing visual
   * feedback to users about which element they're interacting with.
   */
  const [hoveredFilter, setHoveredFilter] = useState<FilterType | null>(null);

  /**
   * useState Hook: Track hover state for "Clear Completed" button
   *
   * hoveredClear is a simple boolean:
   *   - false: Button is not being hovered (default)
   *   - true: Button is being hovered
   *
   * This state controls the opacity/color change on the "Clear Completed"
   * button when the user's mouse is over it.
   */
  const [hoveredClear, setHoveredClear] = useState(false);

  // ========================================
  // RENDER
  // ========================================

  /**
   * React Fragment: <>...</>
   *
   * This is a shorthand for <React.Fragment>.
   * Fragments allow us to return multiple elements from a component
   * without adding an extra DOM node (like a <div> wrapper).
   *
   * Why use Fragment instead of <div>?
   *   - Keeps the DOM tree flatter (better performance)
   *   - Doesn't interfere with CSS layout (padding, margins, flexbox)
   *   - Semantic - we're not introducing an unnecessary container
   *
   * Without Fragment, we would need:
   *   return <div><div>Filter bar</div><div>Mobile buttons</div></div>
   *
   * With Fragment:
   *   return <><div>Filter bar</div><div>Mobile buttons</div></>
   */
  return (
    <>
      {/* ========================================
          MAIN FILTER BAR (Desktop + Counter + Clear)
          ========================================

          This section contains three main elements:
          1. Items left counter (left side)
          2. Filter buttons - shown on desktop (center)
          3. Clear completed button (right side)
      */}
      <div
        /**
         * Semantic class name for styling hooks
         * Using descriptive class names makes CSS targeting easier
         */
        className="todo-filter-bar"

        style={{
          width: "100%",                    // Full width of parent container
          minHeight: "64px",                // Minimum height for touch targets
          borderTopLeftRadius,              // Apply conditional top-left radius
          borderTopRightRadius,             // Apply conditional top-right radius
          borderBottomLeftRadius: "0",      // No bottom-left radius (straight edge)
          borderBottomRightRadius: "0",     // No bottom-right radius (straight edge)
          backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF", // Theme-based background
          borderTop: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",     // Top border
          borderLeft: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",    // Left border
          borderRight: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",   // Right border
          borderBottom: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0", // Bottom border
          display: "flex",                  // Use flexbox for horizontal layout
          alignItems: "center",             // Vertically center all children
          justifyContent: "space-between",  // Distribute space: left, center, right
          padding: "16px 20px",             // Internal spacing
          gap: "12px",                      // Minimum space between items
          flexWrap: "wrap",                 // Allow items to wrap on very small screens
        }}
      >
        {/* ========================================
            ITEMS LEFT COUNTER
            ========================================

            This displays the number of uncompleted (active) todos.
            Example text: "5 items left"
        */}
        <span
          /**
           * Semantic class name for targeting the counter
           */
          className="items-counter"

          style={{
            fontFamily: "Josefin Sans, sans-serif",  // Custom font
            fontWeight: "400",                        // Normal weight
            /**
             * Responsive font size using clamp():
             *   - Minimum: 12px (very small screens)
             *   - Preferred: 2.5vw (2.5% of viewport width)
             *   - Maximum: 14px (larger screens)
             *
             * This ensures the counter text remains readable on all screen sizes
             * while scaling appropriately with the viewport.
             */
            fontSize: "clamp(12px, 2.5vw, 14px)",
            lineHeight: "1.5",                       // Readable line height
            letterSpacing: "-0.19px",                // Tight letter spacing
            /**
             * Text color based on theme:
             *   - Dark mode: #5B5E7E (muted gray-blue - subtle)
             *   - Light mode: #9495A5 (medium gray)
             *
             * These colors are intentionally subtle because the counter is
             * secondary information - not the primary action.
             */
            color: isDarkMode ? "#5B5E7E" : "#9495A5",
          }}
        >
          {/* ========================================
              TEMPLATE LITERAL FOR DYNAMIC TEXT
              ========================================

              Template literals (backticks) allow embedding expressions in strings:
              - {itemsLeft} is replaced with the actual number
              - " items left" is static text

              Examples:
              - itemsLeft = 5 → "5 items left"
              - itemsLeft = 0 → "0 items left"
              - itemsLeft = 1 → "1 items left" (note: grammar could be improved)

              This is a cleaner alternative to string concatenation:
              itemsLeft + " items left"  // Old way
              `${itemsLeft} items left`  // Modern way
          */}
          {itemsLeft} items left
        </span>

        {/* ========================================
            FILTER BUTTONS (Desktop Only)
            ========================================

            These buttons allow users to filter the todo list.
            They're displayed in a row on desktop-sized screens.

            Available filters:
            - All: Show all todos (completed and active)
            - Active: Show only uncompleted todos
            - Completed: Show only completed todos
        */}
        <div
          /**
           * Semantic class name for desktop filter buttons container
           */
          className="desktop-filter-buttons"

          style={{
            display: "flex",              // Use flexbox for horizontal layout
            gap: "12px",                  // Space between buttons
            justifyContent: "space-between", // Distribute buttons evenly
          }}
        >
          {/* ========================================
              "ALL" FILTER BUTTON
              ========================================

              This button filters to show all todos regardless of completion status.
          */}
          <button
            /**
             * onClick: Event handler for button click
             *
             * When user clicks "All":
             *   1. The onClick event fires
             *   2. onFilterChange is called with argument "all"
             *   3. Parent component updates the filter state to "all"
             *   4. React re-renders with all todos visible
             *
             * This is an example of a CALLBACK FUNCTION PATTERN:
             * - Child component (this button) doesn't manage state
             * - It notifies parent of user action via callback
             * - Parent manages the actual state and decides what to render
             */
            onClick={() => onFilterChange("all")}

            /**
             * onMouseEnter: Event handler when mouse enters button
             *
             * When user hovers over the button:
             *   1. The onMouseEnter event fires
             *   2. setHoveredFilter is called with argument "all"
             *   3. hoveredFilter state updates to "all"
             *   4. Component re-renders with updated button color
             *
             * This provides visual feedback that the button is interactive.
             */
            onMouseEnter={() => setHoveredFilter("all")}

            /**
             * onMouseLeave: Event handler when mouse leaves button
             *
             * When user moves mouse away from the button:
             *   1. The onMouseLeave event fires
             *   2. setHoveredFilter is called with argument null
             *   3. hoveredFilter state updates to null
             *   4. Component re-renders with button returning to normal color
             *
             * This resets the hover state, completing the hover effect.
             */
            onMouseLeave={() => setHoveredFilter(null)}

            style={{
              fontFamily: "Josefin Sans, sans-serif",  // Custom font
              fontWeight: "700",                        // Bold weight
              fontSize: "14px",                        // Fixed font size
              lineHeight: "100%",                      // Tight line height
              letterSpacing: "-0.19px",                // Letter spacing

              /**
               * Complex conditional color logic:
               *
               * This nested ternary operator determines button color based on:
               *   1. Is this the currently active filter?
               *   2. Is the user hovering over this button?
               *   3. What is the current theme?
               *
               * Logic breakdown:
               *   - If filter === "all" (active):
               *       → Color: #3A7CFD (bright blue - indicates active state)
               *
               *   - Else if hoveredFilter === "all" (hovered but not active):
               *       → Dark mode: #C8CBE7 (light gray-purple - bright)
               *       → Light mode: #494C6B (dark gray-blue - readable)
               *
               *   - Else (neither active nor hovered):
               *       → Dark mode: #5B5E7E (muted gray-blue - subtle)
               *       → Light mode: #9495A5 (medium gray - subtle)
               *
               * This creates three distinct visual states:
               *   1. Active: Bright blue (clearly indicates current selection)
               *   2. Hovered: Brighter color (indicates interactivity)
               *   3. Normal: Subtle color (doesn't distract from active filter)
               */
              color:
                filter === "all"
                  ? "#3A7CFD"              // Active state - blue
                  : hoveredFilter === "all"
                    ? isDarkMode
                      ? "#C8CBE7"          // Hovered + dark mode
                      : "#494C6B"          // Hovered + light mode
                    : isDarkMode
                      ? "#5B5E7E"          // Normal + dark mode
                      : "#9495A5",         // Normal + light mode

              backgroundColor: "transparent", // Transparent background (button styling removed)
              border: "none",                 // Remove default button border
              cursor: "pointer",              // Show pointer cursor on hover
              padding: "4px 8px",             // Internal spacing for larger click area
            }}
          >
            All
          </button>

          {/* ========================================
              "ACTIVE" FILTER BUTTON
              ========================================

              This button filters to show only uncompleted todos.
              It follows the exact same pattern as the "All" button.
          */}
          <button
            /**
             * Same pattern as "All" button, but passes "active" instead.
             * This demonstrates CODE REUSABILITY - same logic, different data.
             */
            onClick={() => onFilterChange("active")}
            onMouseEnter={() => setHoveredFilter("active")}
            onMouseLeave={() => setHoveredFilter(null)}

            /**
             * Identical styling to "All" button, except the conditional checks
             * for "active" instead of "all". This ensures consistent appearance
             * across all filter buttons.
             */
            style={{
              fontFamily: "Josefin Sans, sans-serif",
              fontWeight: "700",
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "-0.19px",

              /**
               * Same color logic as "All" button, but checking for "active":
               *   - Active: #3A7CFD (blue)
               *   - Hovered: Theme-dependent brighter color
               *   - Normal: Theme-dependent subtle color
               */
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

          {/* ========================================
              "COMPLETED" FILTER BUTTON
              ========================================

              This button filters to show only completed todos.
              Same pattern as previous buttons.
          */}
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

        {/* ========================================
            CLEAR COMPLETED BUTTON
            ========================================

            This button removes all completed todos from the list.
            It's a destructive action, so it's placed on the right side
            to prevent accidental clicks.
        */}
        <button
          /**
           * Semantic class name for the clear button
           */
          className="clear-completed-btn"

          /**
           * onClick: Event handler for clear button click
           *
           * When user clicks "Clear Completed":
           *   1. The onClick event fires
           *   2. onClearCompleted callback is called
           *   3. Parent component removes all completed todos from state
           *   4. React re-renders the list without completed items
           *
           * This is a DESTRUCTIVE ACTION - it permanently deletes data.
           * In a real app, you might want to:
           *   - Show a confirmation dialog
           *   - Add an "undo" option
           *   - Require a double-click
           */
          onClick={onClearCompleted}

          /**
           * onMouseEnter: Event handler when mouse enters button
           *
           * Updates hoveredClear state to true, which changes the button color.
           * This provides visual feedback that the button is interactive.
           */
          onMouseEnter={() => setHoveredClear(true)}

          /**
           * onMouseLeave: Event handler when mouse leaves button
           *
           * Resets hoveredClear state to false, returning button to normal color.
           */
          onMouseLeave={() => setHoveredClear(false)}

          style={{
            fontFamily: "Josefin Sans, sans-serif",  // Custom font
            fontWeight: "400",                        // Normal weight (not bold)
            fontSize: "14px",                        // Font size
            lineHeight: "100%",                      // Tight line height
            letterSpacing: "-0.19px",                // Letter spacing
            textAlign: "right",                      // Right-align the text

            /**
             * Conditional color based on hover state and theme:
             *
             * If hoveredClear === true:
             *   - Dark mode: #C8CBE7 (lighter - more prominent)
             *   - Light mode: #494C6B (darker - more prominent)
             *
             * If hoveredClear === false:
             *   - Dark mode: #5B5E7E (muted - less prominent)
             *   - Light mode: #9495A5 (lighter - less prominent)
             *
             * The hover state makes the text more prominent, indicating
             * that this is an interactive element.
             */
            color: hoveredClear
              ? isDarkMode
                ? "#C8CBE7"              // Hovered + dark mode
                : "#494C6B"              // Hovered + light mode
              : isDarkMode
                ? "#5B5E7E"              // Normal + dark mode
                : "#9495A5",             // Normal + light mode

            backgroundColor: "transparent", // Transparent background
            border: "none",                 // No border
            cursor: "pointer",              // Pointer cursor on hover
            padding: "4px 8px",             // Internal spacing
          }}
        >
          Clear Completed
        </button>
      </div>

      {/* ========================================
          MOBILE FILTER BUTTONS SECTION
          ========================================

          This section contains filter buttons specifically for mobile devices.
          It's a duplicate of the desktop filter buttons because:
            - On mobile, the main filter bar is too crowded
          - Mobile users need larger tap targets
          - The layout is different (centered instead of space-between)

          Note: This is currently hidden (display: "none") in the inline styles.
          In a production app, this would use CSS media queries to show/hide
          based on screen width, or a responsive design library.

          Alternative approaches:
            - Use Tailwind's responsive classes (hidden md:hidden md:flex)
          - Use CSS media queries in a separate stylesheet
          - Use a conditional render based on window.innerWidth state
      */}
      <div
        /**
         * Semantic class name for mobile filter buttons container
         */
        className="todo-filter-buttons"

        style={{
          width: "100%",                    // Full width
          height: "48px",                   // Fixed height for mobile
          backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF", // Theme background
          borderLeft: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",    // Left border
          borderRight: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",   // Right border
          borderBottomLeftRadius,          // Apply conditional bottom-left radius
          borderBottomRightRadius,         // Apply conditional bottom-right radius
          borderBottom: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0", // Bottom border
          borderTop: "none",                // No top border (attached to filter bar above)

          display: "flex",                  // Use flexbox
          alignItems: "center",             // Vertically center buttons
          justifyContent: "center",         // Horizontally center buttons
          gap: "16px",                      // Space between filter buttons
          padding: "12px 24px",             // Internal spacing

          /**
           * Currently hidden:
           *
           * In a production app, this would be conditionally displayed
           * based on screen width using CSS media queries or responsive classes.
           *
           * Example with Tailwind:
           *   className="hidden md:flex"  // Hidden on mobile, flex on desktop
           *
           * Example with CSS:
           *   @media (max-width: 767px) {
           *     display: flex;
           *   }
           */
          display: "none",
        }}
      >
        {/* ========================================
            MOBILE "ALL" FILTER BUTTON
            ========================================

            This is a duplicate of the desktop "All" button for mobile layout.
            The code is identical - this demonstrates CODE DUPLICATION which
            should ideally be avoided.

            Better approach: Create a reusable FilterButton component:
            ```
            function FilterButton({ filter, currentFilter, onFilterChange, label, isDarkMode }) {
              const [hovered, setHovered] = useState(false);
              return (
                <button
                  onClick={() => onFilterChange(filter)}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  style={{ /* conditional styling based on hovered, filter, currentFilter *\/ }}
                >
                  {label}
                </button>
              );
            }
            ```
        */}
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

        {/* ========================================
            MOBILE "ACTIVE" FILTER BUTTON
            ======================================== */}
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

        {/* ========================================
            MOBILE "COMPLETED" FILTER BUTTON
            ======================================== */}
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
