/**
 * ========================================
 * TODO INPUT COMPONENT
 * ========================================
 *
 * Purpose: Input field for creating new todo items
 *
 * Props:
 *   - isDarkMode: Current theme state (default: true)
 *   - onAddTodo: Callback function to add a new todo
 *
 * Features:
 *   - Text input with placeholder
 *   - Empty circle visual indicator
 *   - Submit on Enter key press
 *   - Auto-clears after submission
 *   - Responsive sizing using clamp()
 *
 * State:
 *   - inputValue: Current text in the input field
 *
 * Keyboard Handling:
 *   - Enter key: Submits the todo and clears the input
 */

// ========================================
// IMPORTS
// ========================================

// React hooks
import { useState } from "react";

// TypeScript type for keyboard events
import type { KeyboardEvent } from "react";

// ========================================
// TYPE DEFINITION
// ========================================

/**
 * Interface defining the props that ToDoInput component accepts
 */
interface ToDoInputProps {
  isDarkMode?: boolean;              // Theme state (optional, defaults to true)
  onAddTodo: (text: string) => void; // Function called when user submits a new todo
}

// ========================================
// COMPONENT
// ========================================

export function ToDoInput({ isDarkMode = true, onAddTodo }: ToDoInputProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  /**
   * useState Hook: Creates state for the input field value
   * When inputValue changes, React re-renders this component
   */
  const [inputValue, setInputValue] = useState("");

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * Handle Enter Key Press
   * @param e - Keyboard event from the input element
   *
   * This function is triggered whenever a key is pressed while typing in the input.
   * It checks if the Enter key was pressed and if there's actual text (not just spaces).
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Check if Enter key was pressed AND input is not empty (after trimming whitespace)
    if (e.key === "Enter" && inputValue.trim()) {
      // Call the parent's onAddTodo function with the trimmed text
      onAddTodo(inputValue.trim());
      // Clear the input field for the next todo
      setInputValue("");
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      // Tailwind CSS classes:
      // - relative: enable positioning context
      // - w-full: full width
      // - max-w-2xl: maximum width of 672px
      // - px-4 sm:px-6: responsive horizontal padding
      // - flex: use flexbox layout
      // - items-center: vertically center children
      // - rounded: rounded corners
      className="relative todo-input w-full max-w-2xl px-4 sm:px-6 flex items-center rounded"

      // Inline styles for custom appearance
      style={{
        minHeight: "64px",  // Minimum height for the input container
        backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF", // Background color based on theme
        border: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0", // Border color
        padding: "16px 20px", // Internal spacing
        gap: "12px",           // Space between circle and input
        boxShadow: isDarkMode
          ? "0px 35px 50px -15px rgba(0, 0, 0, 0.5)"     // Dark theme shadow
          : "0px 35px 50px -15px rgba(194, 195, 214, 0.5)", // Light theme shadow
      }}
    >
      {/* ========================================
          EMPTY CIRCLE (Visual Indicator)
          ======================================== */}
      {/* This circle is decorative only - matches the todo item checkboxes */}
      <div
        style={{
          width: "20px",    // Circle diameter
          height: "20px",   // Circle diameter
          minWidth: "20px", // Prevent shrinking in flexbox
          borderRadius: "50%", // Make it circular (50% = circle)
          border: `1px solid ${isDarkMode ? "#393A4B" : "#E3E4F1"}`, // Border color
          flexShrink: 0,    // Prevent from shrinking
        }}
      />

      {/* ========================================
          TEXT INPUT FIELD
          ======================================== */}
      <input
        type="text"                          // Input type for text entry
        placeholder="Create a new todo…"      // Hint text shown when empty
        value={inputValue}                    // Controlled component: value = state
        onChange={(e) => setInputValue(e.target.value)} // Update state when user types
        onKeyDown={handleKeyDown}            // Handle Enter key press
        className="flex-1 bg-transparent outline-none text-base sm:text-lg"
        style={{
          fontFamily: "Josefin Sans, sans-serif", // Use custom font
          fontWeight: "400",                        // Normal font weight
          fontSize: "clamp(14px, 4vw, 18px)",      // Responsive font size
          lineHeight: "normal",                   // Normal line height
          letterSpacing: "-0.25px",              // Slight letter spacing
          color: isDarkMode ? "#C8CBE7" : "#393A4B", // Text color based on theme
          minWidth: 0,                            // Allow text to shrink
        }}
      />
    </div>
  );
}
