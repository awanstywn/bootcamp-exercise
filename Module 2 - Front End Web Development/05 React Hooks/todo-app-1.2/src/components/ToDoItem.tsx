/**
 * ========================================
 * TODO ITEM COMPONENT
 * ========================================
 *
 * Purpose: Displays a single todo item with drag-and-drop support
 *
 * Props:
 *   - id: Unique identifier for the todo item (required for drag-and-drop)
 *   - isDarkMode: Current theme state (default: true)
 *   - text: The todo text content (default: "Sample To-Do Item")
 *   - completed: Whether the todo is marked as complete (default: false)
 *   - onToggle: Callback function when checkbox is clicked
 *   - onDelete: Callback function when delete button is clicked
 *   - isFirst: Whether this is the first item in the list (for rounded corners)
 *   - isLast: Whether this is the last item in the list (for border styling)
 *
 * Features:
 *   - Drag-and-drop reordering using @dnd-kit library
 *   - Gradient checkbox that fills when completed
 *   - Hover effects on checkbox and delete button
 *   - Strikethrough text when completed
 *   - Visual feedback during dragging (opacity change)
 *   - Responsive typography using clamp()
 *
 * Libraries Used:
 *   - @dnd-kit/sortable: Provides useSortable hook for drag-and-drop
 *   - @dnd-kit/utilities: Provides CSS utility for transform styles
 *
 * Drag-and-Drop Concepts:
 *   - Sortable: Items that can be reordered by dragging
 *   - useSortable: Hook that makes an element draggable and sortable
 *   - Transform: Position changes during drag (x, y coordinates, scaling)
 *   - Transition: Smooth animation during reordering
 *
 * State:
 *   - isHovered: Tracks whether mouse is over the uncompleted checkbox
 */

// ========================================
// IMPORTS
// ========================================

// @dnd-kit imports for drag-and-drop functionality
import { useSortable } from "@dnd-kit/sortable"; // Hook to make elements sortable
import { CSS } from "@dnd-kit/utilities"; // Utility for transforming drag styles

// React hooks
import { useState } from "react";

// ========================================
// TYPE DEFINITION
// ========================================

/**
 * Interface defining the props that ToDoItem component accepts
 * All props are optional except for id, which is required for drag-and-drop
 */
interface ToDoItemProps {
  id: string; // Unique identifier - REQUIRED for drag-and-drop to work
  isDarkMode?: boolean; // Theme state (optional, defaults to true)
  text?: string; // The todo text content (optional, has default)
  completed?: boolean; // Completion status (optional, defaults to false)
  onToggle?: () => void; // Function called when user clicks the checkbox
  onDelete?: () => void; // Function called when user clicks the delete button
  onUpdate?: (newText: string) => void; // Function called when user saves edited text
  isFirst?: boolean; // Is this the first item? (for top border radius)
  isLast?: boolean; // Is this the last item? (for bottom border)
}

// ========================================
// COMPONENT
// ========================================

export function ToDoItem({
  id, // Destructure id from props
  isDarkMode = true, // Default to dark mode if not specified
  text = "Sample To-Do Item", // Default text if none provided
  completed = false, // Default to not completed
  onToggle, // Optional callback function
  onDelete, // Optional callback function
  onUpdate, // Optional callback for saving edited text
  isFirst = false, // Default to not being the first item
  isLast = false, // Default to not being the last item
}: ToDoItemProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  /**
   * useState Hook: Creates state for hover effect on checkbox
   *
   * This state is only used for the uncompleted checkbox to show/hide
   * the gradient background on hover. The completed checkbox always shows
   * the gradient, so it doesn't need this state.
   *
   * When isHovered changes, React re-renders this component with the new value
   */
  const [isHovered, setIsHovered] = useState(false);

  /**
   * useState Hook: State for inline editing
   *   - isEditing: Boolean to track if we're in edit mode
   *   - setIsEditing: Function to toggle edit mode
   *
   * When isEditing is true, an input field replaces the text display.
   */
  const [isEditing, setIsEditing] = useState(false);

  /**
   * useState Hook: State for the edited text content
   *   - editedText: The current value of the text being edited
   *   - setEditedText: Function to update the edited text
   *
   * Initialized with the current todo text. Updated as user types.
   * When user confirms (Enter key), this value is passed to onUpdate callback.
   */
  const [editedText, setEditedText] = useState(text);

  // ========================================
  // EVENT HANDLERS FOR INLINE EDITING
  // ========================================

  /**
   * Handle double-click to enter edit mode
   * Triggered when user double-clicks the todo text
   */
  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditedText(text); // Reset to current text in case it was modified
  };

  /**
   * Handle saving edited text
   * Triggered when user presses Enter or clicks confirm
   */
  const handleSaveEdit = () => {
    if (editedText.trim()) {
      // Only save if text is not empty
      onUpdate?.(editedText.trim()); // Call parent callback to update the todo
      setIsEditing(false);
    }
  };

  /**
   * Handle canceling the edit
   * Triggered when user presses Escape
   */
  const handleCancelEdit = () => {
    setEditedText(text); // Reset to original text
    setIsEditing(false);
  };

  /**
   * Handle key press in edit input field
   * @param e - Keyboard event
   * Triggers save on Enter, cancel on Escape
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // ========================================
  // DRAG-AND-DROP SETUP
  // ========================================

  /**
   * useSortable Hook: Makes this todo item draggable and sortable
   *
   * This hook is provided by @dnd-kit/sortable library. It returns everything
   * needed to make an element draggable within a sortable context.
   *
   * What it returns:
   *   - attributes: ARIA attributes for accessibility (role, aria-pressed, etc.)
   *   - listeners: Event handlers for drag events (must be spread on draggable element)
   *   - setNodeRef: React ref callback that connects the element to dnd-kit
   *   - transform: Object with x, y, and scale values during drag
   *   - transition: CSS transition string for smooth animations
   *   - isDragging: Boolean that's true while this item is being dragged
   *
   * How it works:
   *   1. Pass the unique id to useSortable({ id })
   *   2. Apply setNodeRef to the element's ref attribute
   *   3. Spread attributes on the draggable element (for accessibility)
   *   4. Spread listeners on the draggable element (enables drag events)
   *   5. Use transform and transition for visual feedback during drag
   *
   * The parent component (App.tsx) wraps the list in:
   *   - <DndContext>: Manages drag events and collision detection
   *   - <SortableContext>: Provides the list of item IDs for ordering
   */
  const {
    attributes, // Accessibility attributes for screen readers
    listeners, // Event handlers that enable dragging (onPointerDown, etc.)
    setNodeRef, // Ref function - connects this DOM element to dnd-kit
    transform, // Current position during drag: { x, y, scaleX, scaleY }
    transition, // CSS transition for smooth animation when not dragging
    isDragging, // Boolean: true when this item is currently being dragged
  } = useSortable({ id }); // Pass the unique ID - REQUIRED for drag-and-drop to work

  // ========================================
  // STYLES
  // ========================================

  /**
   * Compute drag styles
   *
   * CSS.Transform.toString(transform) converts the transform object to a CSS string:
   *   - When not dragging: "translate3d(0px, 0px, 0px)"
   *   - When dragging: "translate3d(120px, 50px, 0px) scale(1.05)"
   *
   * This uses CSS transforms which are GPU-accelerated for smooth 60fps animations.
   * The opacity change provides visual feedback that this item is being moved.
   */
  const style = {
    transform: CSS.Transform.toString(transform), // Convert transform object to CSS
    transition, // Apply smooth transition
    opacity: isDragging ? 0.5 : 1, // Fade to 50% opacity when dragging
  };

  /**
   * Compute border radius for first item
   *
   * Only the first item in the list should have rounded top corners.
   * This creates a card-like appearance where the first item is the "top"
   * of the card with rounded corners, and items below have square corners.
   *
   * This is a common UI pattern for todo lists and card-based layouts.
   */
  const borderRadius = {
    borderTopLeftRadius: isFirst ? "5px" : "0", // Round top-left only if first
    borderTopRightRadius: isFirst ? "5px" : "0", // Round top-right only if first
    borderBottomLeftRadius: "0", // Always square at bottom-left
    borderBottomRightRadius: "0", // Always square at bottom-right
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      // ========================================
      // DRAG-AND-DROP CONNECTION
      // ========================================

      /**
       * setNodeRef: Connects this DOM element to the dnd-kit library
       *
       * This is CRITICAL for drag-and-drop to work. It tells dnd-kit:
       *   - Which DOM element corresponds to this item
       *   - Where to apply drag transformations
       *   - How to measure the element's size and position
       *
       * Without this ref, the item would not be draggable at all.
       */
      ref={setNodeRef}
      // Inline styles combining border radius, theme colors, and drag styles
      style={{
        width: "100%", // Take full width of parent container
        minHeight: "64px", // Minimum height for touch-friendly clicking
        ...borderRadius, // Apply conditional border radius (spread operator)
        backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF", // Theme-based background
        border: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0", // Border color

        /**
         * Bottom border logic:
         *   - If it's the last item: no bottom border (undefined)
         *   - If not last item: show border to separate from next item
         *
         * This creates a visual separation between items while removing
         * the border after the last item for a cleaner appearance.
         */
        borderBottom: isLast
          ? undefined // No border on last item
          : isDarkMode
            ? "1px solid #393A5A" // Dark mode border color
            : "1px solid #E0E0E0", // Light mode border color

        display: "flex", // Use flexbox for horizontal layout
        alignItems: "center", // Vertically center checkbox, text, and delete button
        padding: "16px 20px", // Internal spacing
        gap: "12px", // Space between children (checkbox, text, delete)
        ...style, // Apply drag-and-drop transform and opacity styles
      }}
    >
      {/* ========================================
          CHECKBOX SECTION
          ========================================

          This section uses CONDITIONAL RENDERING based on the 'completed' prop.

          Ternary operator: condition ? true : false
          - If completed === true: render gradient circle with checkmark
          - If completed === false: render empty circle with hover gradient

          This demonstrates React's ability to render different UI based on state.
      */}

      {completed ? (
        // ========================================
        // COMPLETED CHECKBOX (Gradient + Checkmark)
        // ========================================

        /**
         * When todo is completed, show:
         *   - Circular background with gradient (cyan to purple)
         *   - White checkmark SVG icon
         *   - Clickable to toggle back to uncompleted
         */
        <div
          /**
           * onClick: Event handler for checkbox click
           *
           * When user clicks the checkbox:
           *   1. The onClick event fires
           *   2. The onToggle callback function is called
           *   3. The parent component (App.tsx) updates the todo's completed status
           *   4. React re-renders this component with completed=false
           *   5. The conditional rendering switches to the uncompleted checkbox
           *
           * This is an example of LIFTING STATE UP - the parent manages the state,
           * and this component just notifies the parent of user actions.
           */
          onClick={onToggle}
          style={{
            width: "20px", // Circle diameter
            height: "20px", // Circle diameter
            minWidth: "20px", // Prevent shrinking in flexbox
            borderRadius: "50%", // Make it circular (50% = perfect circle)
            border: "none", // No border on completed checkbox
            /**
             * Linear gradient background:
             *   - Starts at top-left (135deg angle)
             *   - Color 1: #55DDFF (bright cyan)
             *   - Color 2: #C058F3 (vibrant purple)
             *
             * This creates an eye-catching visual indicator for completed items.
             * Gradients are created using CSS linear-gradient() function.
             */
            background: "linear-gradient(135deg, #55DDFF 0%, #C058F3 100%)",
            flexShrink: 0, // Prevent from shrinking in flex layout
            cursor: "pointer", // Show pointer cursor on hover
            display: "flex", // Use flexbox to center the checkmark
            alignItems: "center", // Vertically center checkmark
            justifyContent: "center", // Horizontally center checkmark
          }}
        >
          {/* ========================================
              CHECKMARK ICON (SVG)
              ========================================

              SVG (Scalable Vector Graphics):
              - XML-based vector image format
              - Scales infinitely without losing quality
              - Perfect for icons and logos
              - Can be styled with CSS properties
          */}
          <svg
            width="12" // Icon width in pixels
            height="12" // Icon height in pixels
            viewBox="0 0 24 24" // Coordinate system: 0,0 to 24,24
            fill="none" // No fill color (transparent)
            stroke="white" // White stroke color for checkmark
            strokeWidth="3" // Thickness of checkmark lines
            strokeLinecap="round" // Rounded line ends
            strokeLinejoin="round" // Rounded line corners
          >
            {/* ========================================
                POLYLINE - The Checkmark Shape
                ========================================

                A polyline is a connected series of line segments.
                This draws the classic checkmark (✓) shape.

                Points breakdown:
                - (20, 6): Starting point - top-right
                - (9, 17): Middle point - center-left (creates the angle)
                - (4, 12): End point - bottom-left

                Visual: Draw a line from top-right to center, then to bottom-left
            */}
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      ) : (
        // ========================================
        // UNCOMPLETED CHECKBOX (Empty Circle with Hover Gradient)
        // ========================================

        /**
         * When todo is not completed, show:
         *   - Outer div with gradient background on hover
         *   - Inner div with circular border
         *   - Gradient appears on mouse enter, disappears on mouse leave
         *
         * This uses a nested div structure to create the hover effect:
         *   - Outer div: Shows gradient on hover (with padding)
         *   - Inner div: Always shows the circular border (with background color)
         *
         * On hover, the outer div's padding creates a "border" effect with the gradient.
         */
        <div
          onClick={onToggle} // Toggle to completed when clicked
          onMouseEnter={() => setIsHovered(true)} // Mouse enters: set hover state to true
          onMouseLeave={() => setIsHovered(false)} // Mouse leaves: set hover state to false
          style={{
            width: "22px", // Slightly larger to accommodate gradient padding
            height: "22px",
            minWidth: "22px",
            borderRadius: "50%", // Make circular
            flexShrink: 0,
            cursor: "pointer",
            display: "flex", // Flexbox to center inner circle
            alignItems: "center",
            justifyContent: "center",

            /**
             * Conditional background based on hover state:
             *   - If isHovered === true: show gradient background
             *   - If isHovered === false: transparent (no background)
             *
             * This demonstrates STATE-DRIVEN STYLING - the visual appearance
             * changes based on the isHovered state value.
             *
             * The gradient is the same as the completed checkbox to provide
             * visual continuity and hint at what will happen when clicked.
             */
            background: isHovered
              ? "linear-gradient(135deg, #55DDFF 0%, #C058F3 100%)"
              : "transparent",

            /**
             * Conditional padding based on hover state:
             *   - If isHovered === true: 1px padding (creates gradient border effect)
             *   - If isHovered === false: 0 padding (no gradient visible)
             *
             * This technique creates a gradient border effect without using
             * actual CSS border property (which doesn't support gradients).
             */
            padding: isHovered ? "1px" : "0",
          }}
        >
          {/* ========================================
              INNER CIRCLE (The Visible Border)
              ========================================

              This inner div always has a border, creating the visible circle.
              When the outer div has the gradient background (on hover),
              the gradient shows through the 1px padding, creating a
              gradient border effect around this inner circle.
          */}
          <div
            style={{
              width: "20px", // Inner circle size
              height: "20px",
              borderRadius: "50%", // Make circular

              /**
               * Border color based on theme:
               *   - Dark mode: #393A4B (subtle blue-gray)
               *   - Light mode: #E3E4F1 (light gray-blue)
               *
               * Template literals (backticks) allow embedding expressions
               * in strings, useful for dynamic values.
               */
              border: `1px solid ${isDarkMode ? "#393A4B" : "#E3E4F1"}`,

              /**
               * Background color:
               * This covers the gradient background on hover, except for the
               * 1px padding area where the gradient shows through as a border.
               *
               * The background matches the todo item background so it blends in.
               */
              background: isDarkMode ? "#25273D" : "#FFFFFF",

              display: "flex", // Flexbox (currently not used, but could center content)
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>
      )}

      {/* ========================================
          TODO TEXT SECTION
          ========================================

          This section has two modes:
          1. Display mode: Shows the todo text (default)
          2. Edit mode: Shows an input field for inline editing (on double-click)

          Display mode features:
          - Draggable: Users can drag from here to reorder
          - Double-clickable: Double-click to enter edit mode
          - Strikethrough when completed: Visual feedback
          - Responsive font size: Scales with viewport
          - Truncation: Long words break to prevent overflow

          Edit mode features:
          - Input field for editing text
          - Save on Enter key press
          - Cancel on Escape key press
      */}

      {isEditing ? (
        // EDIT MODE: INPUT FIELD
        <input
          autoFocus
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancelEdit}
          className="flex-1 min-w-0"
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "400",
            fontSize: "clamp(14px, 3vw, 18px)",
            lineHeight: "1.5",
            letterSpacing: "-0.25px",
            padding: "8px 12px",
            borderRadius: "4px",
            border: isDarkMode ? "2px solid #55DDFF" : "2px solid #5596FF",
            backgroundColor: isDarkMode ? "#393A5A" : "#F0F4FF",
            color: isDarkMode ? "#C8CBE7" : "#494C6B",
            outline: "none",
            transition: "all 0.2s ease",
          }}
        />
      ) : (
        // DISPLAY MODE: TEXT SPAN
        <span
          className="flex-1 min-w-0"
          onDoubleClick={handleDoubleClick}
          style={{
            fontFamily: "Josefin Sans, sans-serif",
            fontWeight: "400",
            fontSize: "clamp(14px, 3vw, 18px)",
            lineHeight: "1.5",
            letterSpacing: "-0.25px",
            color: completed
              ? isDarkMode
                ? "#4D5067"
                : "#D1D2DA"
              : isDarkMode
                ? "#C8CBE7"
                : "#494C6B",
            textDecoration: completed ? "line-through" : "none",
            cursor: "grab",
            userSelect: "none",
            wordBreak: "break-word",
            ...attributes,
          }}
          {...listeners}
        >
          {text}
        </span>
      )}

      {/* ========================================
          DELETE BUTTON SECTION
          ========================================

          This button allows users to delete the todo item.
          It features hover effects and an X (cross) icon.
      */}
      <button
        /**
         * onClick: Event handler for delete button click
         *
         * When user clicks the delete button:
         *   1. The onClick event fires
         *   2. The onDelete callback function is called
         *   3. The parent component (App.tsx) removes this todo from the list
         *   4. React re-renders the list without this item
         *
         * This is another example of LIFTING STATE UP - the parent manages
         * the data, and this component just notifies the parent of user actions.
         */
        onClick={onDelete}
        style={{
          background: "none", // Transparent background (no button styling)
          border: "none", // Remove default button border
          cursor: "pointer", // Show pointer cursor on hover
          padding: "4px", // Internal spacing for larger touch target

          /**
           * Icon color based on theme:
           *   - Dark mode: #767992 (muted gray-blue)
           *   - Light mode: #9495A5 (medium gray)
           *
           * These colors are subtle so the delete button doesn't distract
           * from the todo content. The opacity change on hover provides
           * the visual feedback.
           */
          color: isDarkMode ? "#767992" : "#9495A5",

          opacity: 0.7, // Start at 70% opacity (subtle)

          /**
           * CSS transition for opacity:
           *   - Property: opacity
           *   - Duration: 0.2s (200 milliseconds)
           *   - Timing function: ease (default - smooth start and end)
           *
           * This creates a smooth fade effect when hovering over the button.
           * The transition is applied automatically by CSS when opacity changes.
           */
          transition: "opacity 0.2s",
        }}
        /**
         * Mouse enter event handler:
         *
         * When mouse enters the button area:
         *   1. The onMouseEnter event fires
         *   2. We access e.currentTarget (the button element)
         *   3. We set its opacity style to "1" (100% - fully visible)
         *
         * This creates a hover effect where the delete button becomes
         * more prominent when the user's mouse is over it.
         *
         * Note: We use currentTarget instead of target because:
         *   - currentTarget always refers to the button (the event handler's element)
         *   - target might refer to a child element (the SVG icon inside)
         */
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        /**
         * Mouse leave event handler:
         *
         * When mouse leaves the button area:
         *   1. The onMouseLeave event fires
         *   2. We access e.currentTarget (the button element)
         *   3. We set its opacity style back to "0.7" (70% - subtle)
         *
         * This resets the button to its original subtle appearance,
         * completing the hover effect.
         */
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        /**
         * ARIA label for accessibility:
         *
         * This provides a text description for screen readers.
         * Users who can't see the X icon will hear "Delete todo" instead.
         *
         * Accessibility best practices:
         *   - All interactive elements need accessible labels
         *   - Icons should have text alternatives
         *   - Users should understand functionality without seeing visuals
         */
        aria-label="Delete todo"
      >
        {/* ========================================
            X (CROSS) ICON (SVG)
            ========================================

            This icon represents the delete action.
            It's a simple X shape made from two diagonal lines.
        */}
        <svg
          width="18" // Icon width
          height="18" // Icon height
          viewBox="0 0 24 24" // Coordinate system
          fill="none" // No fill
          stroke="currentColor" // Inherits color from parent (text color)
          strokeWidth="2" // Line thickness
        >
          {/* ========================================
              PATH - Drawing the X Shape

              The <path> element creates complex shapes using the d attribute.
              The d attribute contains path commands:

              M 18 6: Move to (18, 6) - top-right point
              L 6 18: Line to (6, 18) - draws diagonal line to bottom-left
              M 6 6:  Move to (6, 6) - top-left point
              l 12 12: Line to (18, 18) - draws diagonal line to bottom-right
                       (lowercase 'l' is relative to current position)

              This creates two intersecting diagonal lines forming an X.
          */}
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
}
