/**
 * ToDoInput Component
 *
 * Purpose: Input field for creating new todo items
 *
 * Props:
 *   - isDarkMode (boolean, optional): Current theme mode (default: true)
 *   - onAddTodo (function): Callback to add a new todo item with the entered text
 *
 * Features:
 *   - Text input field with placeholder
 *   - Empty circle checkbox (visual only, cannot toggle)
 *   - Submit on Enter key press
 *   - Trims whitespace from input
 *   - Responsive sizing using clamp()
 *   - Adapts colors based on dark/light mode
 *
 * State:
 *   - inputValue: Current text in the input field
 *
 * Keyboard Handling:
 *   - Enter key: Submits the todo and clears the input field
 */

import { useState } from "react";
import type { KeyboardEvent } from "react";

interface ToDoInputProps {
  isDarkMode?: boolean;
  onAddTodo: (text: string) => void;
}

export function ToDoInput({ isDarkMode = true, onAddTodo }: ToDoInputProps) {
  // State to track what the user is typing
  const [inputValue, setInputValue] = useState("");

  /**
   * Handle Enter key press to submit todo
   * Only submits if input is not empty and contains non-whitespace characters
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onAddTodo(inputValue.trim()); // Add the todo via callback
      setInputValue(""); // Clear the input field after submission
    }
  };

  return (
    <div
      className="relative todo-input w-full max-w-2xl px-4 sm:px-6 flex items-center rounded"
      style={{
        minHeight: "64px",
        backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
        border: isDarkMode ? "1px solid #393A5A" : "1px solid #E0E0E0",
        padding: "16px 20px",
        gap: "12px",
        boxShadow: isDarkMode
          ? "0px 35px 50px -15px rgba(0, 0, 0, 0.5)"
          : "0px 35px 50px -15px rgba(194, 195, 214, 0.5)",
      }}
    >
      {/* Empty Circle - Visual indicator, not functional */}
      <div
        style={{
          width: "20px",
          height: "20px",
          minWidth: "20px",
          borderRadius: "50%",
          border: `1px solid ${isDarkMode ? "#393A4B" : "#E3E4F1"}`,
          flexShrink: 0,
        }}
      />

      {/* Text Input Field - Accepts user input */}
      <input
        type="text"
        placeholder="Create a new todo…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // Update state as user types
        onKeyDown={handleKeyDown} // Handle Enter key submission
        className="flex-1 bg-transparent outline-none text-base sm:text-lg"
        style={{
          fontFamily: "Josefin Sans, sans-serif",
          fontWeight: "400",
          fontSize: "clamp(14px, 4vw, 18px)",
          lineHeight: "normal",
          letterSpacing: "-0.25px",
          color: isDarkMode ? "#C8CBE7" : "#393A4B",
          minWidth: 0,
        }}
      />
    </div>
  );
}
