/**
 * ToDoItem Component
 *
 * Purpose: Displays a single todo item in the list with drag-and-drop support
 *
 * Props:
 *   - id (string): Unique identifier for the todo item (used for drag-drop)
 *   - isDarkMode (boolean, optional): Current theme mode (default: true)
 *   - text (string, optional): The todo description text (default: "Sample To-Do Item")
 *   - completed (boolean, optional): Whether todo is marked complete (default: false)
 *   - onToggle (function, optional): Callback when todo completion status toggled
 *   - onDelete (function, optional): Callback when delete button clicked
 *   - isFirst (boolean, optional): Whether this is the first item in list
 *   - isLast (boolean, optional): Whether this is the last item in list
 *
 * Features:
 *   - Checkbox that toggles completion status
 *   - Delete button with hover effect
 *   - Strikethrough text when completed
 *   - Gradient background on checkbox when completed
 *   - Drag-and-drop support via @dnd-kit library
 *   - Hover animations for better UX
 *   - Responsive text sizing
 *
 * Visual States:
 *   - Uncompleted: Empty circle checkbox with border
 *   - Completed: Colored gradient circle with checkmark
 *   - Hovered: Gradient appears on uncompleted checkbox
 *   - Dragging: Item opacity reduces to 0.5
 *
 * State:
 *   - isHovered: Tracks mouse hover for gradient effect
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface ToDoItemProps {
  id: string;
  isDarkMode?: boolean;
  text?: string;
  completed?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function ToDoItem({
  id,
  isDarkMode = true,
  text = "Sample To-Do Item",
  completed = false,
  onToggle,
  onDelete,
  isFirst = false,
  isLast = false,
}: ToDoItemProps) {
  // Track hover state for gradient animation
  const [isHovered, setIsHovered] = useState(false);

  // Set up drag-and-drop functionality using @dnd-kit library
  const {
    attributes, // HTML attributes needed for dragging
    listeners, // Event listeners for drag events
    setNodeRef, // Ref to the draggable element
    transform, // Transform values to apply during drag
    transition, // CSS transition properties
    isDragging, // Whether item is currently being dragged
  } = useSortable({ id });

  // Apply transform and opacity styles during drag operation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Fade out item while dragging
  };

  // Apply rounded corners only to first item in list
  const borderRadius = {
    borderTopLeftRadius: isFirst ? "5px" : "0",
    borderTopRightRadius: isFirst ? "5px" : "0",
    borderBottomLeftRadius: "0",
    borderBottomRightRadius: "0",
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "100%",
        minHeight: "64px",
        ...borderRadius,
        backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
        border: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
        borderBottom: isLast
          ? undefined
          : isDarkMode
            ? "1px solid #393A5A"
            : "1px solid #E0E0E0",
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        gap: "12px",
        ...style,
      }}
    >
      {/* Checkbox Circle - Changes appearance based on completion status */}
      {completed ? (
        // Completed State: Gradient circle with checkmark
        <div
          onClick={onToggle} // Click to mark incomplete
          style={{
            width: "20px",
            height: "20px",
            minWidth: "20px",
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #55DDFF 0%, #C058F3 100%)", // Cyan to purple gradient
            flexShrink: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Checkmark SVG */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      ) : (
        // Uncompleted State: Empty circle that shows gradient on hover
        <div
          onClick={onToggle} // Click to mark complete
          onMouseEnter={() => setIsHovered(true)} // Show gradient on hover
          onMouseLeave={() => setIsHovered(false)} // Hide gradient when leaving
          style={{
            width: "22px",
            height: "22px",
            minWidth: "22px",
            borderRadius: "50%",
            flexShrink: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isHovered
              ? "linear-gradient(135deg, #55DDFF 0%, #C058F3 100%)"
              : "transparent",
            padding: isHovered ? "1px" : "0",
          }}
        >
          {/* Inner circle border - always visible */}
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: `1px solid ${isDarkMode ? "#393A4B" : "#E3E4F1"}`,
              background: isDarkMode ? "#25273D" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>
      )}

      {/* Todo Text - Clickable for dragging, strikethrough when completed */}
      <span
        className="flex-1 min-w-0"
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
          textDecoration: completed ? "line-through" : "none", // Strikethrough when completed
          cursor: "grab", // Show grab cursor for dragging
          wordBreak: "break-word", // Allow text wrapping
          ...attributes, // Apply drag-drop attributes
        }}
        {...listeners} // Apply drag-drop listeners
      >
        {text}
      </span>

      {/* Delete Button - Removes todo when clicked */}
      <button
        onClick={onDelete} // Trigger delete callback
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          color: isDarkMode ? "#767992" : "#9495A5",
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} // Full opacity on hover
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")} // Dim when not hovering
        aria-label="Delete todo"
      >
        {/* X Icon SVG */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
}
