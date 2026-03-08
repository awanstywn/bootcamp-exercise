/**
 * ToDoList Component
 *
 * Purpose: Displays a static list of sample todo items
 *
 * Note: This component is not currently used in the main app.
 * The main App.tsx component handles dynamic todo list rendering with state management.
 *
 * Props:
 *   - isDarkMode (boolean, optional): Current theme mode (default: true)
 *
 * This component serves as a template/reference component for displaying multiple ToDoItem
 * components in a vertical flex layout.
 */

import { ToDoItem } from "./ToDoItem";

interface ToDoListProps {
  isDarkMode?: boolean;
}

export function ToDoList({ isDarkMode = true }: ToDoListProps) {
  return (
    <div className="flex flex-col items-center" style={{ gap: "0" }}>
      {/* Sample todo items - displayed with no gap between them */}
      <ToDoItem
        isDarkMode={isDarkMode}
        text="Complete online JavaScript course"
      />
      <ToDoItem isDarkMode={isDarkMode} text="Jogging for 20 minutes" />
      <ToDoItem isDarkMode={isDarkMode} text="Finish the assignment" />
    </div>
  );
}
