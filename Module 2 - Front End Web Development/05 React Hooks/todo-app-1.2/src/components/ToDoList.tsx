/**
 * ========================================
 * TODO LIST COMPONENT
 * ========================================
 *
 * Purpose: Displays a static list of sample todo items
 *
 * Note: This component is NOT CURRENTLY USED in the application.
 *
 * IMPORTANT: The main App.tsx component handles the dynamic rendering
 *            of todos directly. This component exists as a reference
 *            implementation for displaying a list of ToDoItem components.
 *
 *            In a production app, you might use a component like this to:
 *            - Separate concerns (list logic vs. individual item logic)
 *            - Add list-level features (bulk actions, drag-drop context)
 *            - Improve code organization
 *            - Enable easier testing
 *
 * Props:
 *   - isDarkMode: Current theme state (default: true)
 *
 * Features:
 *   - Renders multiple ToDoItem components in a vertical layout
 *   - Each item has a unique ID (required for React keys)
 *   - No gap between items (they're stacked directly)
 *   - Centered layout with flexbox
 *
 * Current Implementation:
 *   - Static (hardcoded) todo items
 *   - Not interactive (no state management)
 *   - Used for demonstration purposes only
 *
 * Better Implementation Pattern:
 *   Instead of hardcoded items, pass todos as props:
 *   ```
 *   interface ToDoListProps {
 *     isDarkMode?: boolean;
 *     todos: Todo[];  // Array of todo objects
 *     onToggle: (id: string) => void;
 *     onDelete: (id: string) => void;
 *   }
 *   ```
 *
 * React Concepts Demonstrated:
 *   - Component composition (using ToDoItem inside ToDoList)
 *   - Props passing (isDarkMode passed to each ToDoItem)
 *   - List rendering with unique keys
 *   - Flexbox layout for vertical stacking
 */

// ========================================
// IMPORTS
// ========================================

/**
 * ToDoItem Component Import
 *
 * This imports the ToDoItem component which renders individual todo items.
 *
 * ES6 Module Import Syntax:
 *   import { ToDoItem } from "./ToDoItem";
 *
 * This is named import - we're importing a specific export from the file.
 * The ToDoItem component must be exported with:
 *   export function ToDoItem() { ... }
 *
 * File extensions:
 *   - We can omit the .tsx extension in import statements
 *   - TypeScript/React knows to look for .tsx files
 *   - The "./" indicates a relative path from the current file
 *
 * Component Composition:
 *   This demonstrates COMPOSITION - building complex UIs by combining
 *   simpler components. ToDoList is composed of multiple ToDoItem components.
 */
import { ToDoItem } from "./ToDoItem";

// ========================================
// TYPE DEFINITION
// ========================================

/**
 * Interface defining the props that ToDoList component accepts
 *
 * This is a simple interface with only one optional prop.
 * In a production app, this would likely include:
 *   - todos: Array of todo objects to render
 *   - onToggle: Callback for toggling todo completion
 *   - onDelete: Callback for deleting todos
 *   - onReorder: Callback for drag-and-drop reordering
 */
interface ToDoListProps {
  /**
   * isDarkMode: Current theme state
   *
   * Type: boolean (optional)
   * Default: true (dark mode)
   *
   * This prop is passed down to each ToDoItem child component.
   * This pattern is called PROP DRILLING - passing props through
   * intermediate components to reach deeply nested components.
   *
   * Alternative patterns to avoid prop drilling:
   *   - React Context: Provide theme to entire component tree
   *   - Component composition: Pass render functions as children
   *   - State management library: Redux, Zustand, Jotai, etc.
   */
  isDarkMode?: boolean;
}

// ========================================
// COMPONENT
// ========================================

/**
 * ToDoList Component
 *
 * This is a FUNCTIONAL COMPONENT - a JavaScript function that returns JSX.
 *
 * Function Component Syntax:
 *   export function ComponentName(props: PropsType) {
 *     return <div>JSX here</div>;
 *   }
 *
 * Key characteristics:
 *   - Named function (not anonymous)
 *   - Exported for use in other files
 *   - Accepts props as parameter
 *   - Returns JSX (React's HTML-like syntax)
 *
 * Advantages of functional components:
 *   - Simpler than class components
 *   - Can use React Hooks (useState, useEffect, etc.)
 *   - Easier to test
 *   - Less boilerplate code
 *   - Better performance with React.memo
 */
export function ToDoList({ isDarkMode = true }: ToDoListProps) {
  // ========================================
  // RENDER
  // ========================================

  /**
   * Return JSX to describe the UI
   *
   * JSX (JavaScript XML):
   *   - Syntax extension for JavaScript
   *   - Looks like HTML but is actually JavaScript
   *   - Gets compiled to React.createElement() calls
   *   - Can embed JavaScript expressions in curly braces {}
   *
   * Example transformation:
   *   JSX:  <div className="container">Hello</div>
   *   JS:   React.createElement('div', { className: 'container' }, 'Hello')
   *
   * JSX makes React code more readable and easier to write.
   */
  return (
    /**
     * Container div with flexbox layout
     *
     * This div serves as a wrapper for all todo items.
     * It controls the layout and positioning of the list.
     */
    <div
      /**
       * Tailwind CSS classes:
       *   - flex: Use flexbox layout
       *   - flex-col: Column direction (vertical stacking)
       *   - items-center: Horizontally center children
       *
       * Flexbox is a CSS layout system that provides:
       *   - Flexible alignment of items
       *   - Distribution of space
       *   - Responsive layouts without fixed widths
       *
       * Flex-direction column:
       *   Items stack vertically instead of horizontally
       *   This is the default for lists (top to bottom).
       */
      className="flex flex-col items-center"

      /**
       * Inline styles for container appearance
       *
       * We use inline styles here (instead of a separate CSS file) because:
       *   - It's a simple style (just one property)
       *   - It keeps the style close to the component
       *   - It demonstrates inline style syntax
       *
       * For more complex styling, prefer:
       *   - Tailwind CSS classes (as used above)
       *   - CSS modules
       *   - Styled components
       *   - Separate stylesheet
       */
      style={{ gap: "0" }}

      /**
       * Gap: 0
       *
       * The gap property controls spacing between flex items.
       * A gap of 0 means items are stacked directly against each other
       * with no space between them.
       *
       * In this todo list, each ToDoItem has its own border-bottom,
       * so we don't need additional gap spacing.
       *
       * Alternative values:
       *   - gap: "8px" - 8 pixels between items
       *   - gap: "1rem" - 1 root em (relative to font size)
       *   - gap: "0.5rem" - Half the root em size
       */
    >
      {/* ========================================
          SAMPLE TODO ITEMS
          ========================================

          This section demonstrates rendering multiple ToDoItem components.

          Each ToDoItem represents one todo in the list.
          They're stacked vertically due to the parent's flex-col class.

          Static Data:
          These are HARDCODED sample items for demonstration.
          In a real app, these would be:
          - Fetched from an API
          - Loaded from a database
          - Read from local storage
          - Passed in as props from a parent component

          Component Composition:
          We're using the ToDoItem component to build the ToDoList.
          This is a key React pattern - combine simple components to
          create complex UIs.

          Props Passing:
          Each ToDoItem receives:
          - id: Unique identifier (required for React keys)
          - isDarkMode: Theme setting (passed down from this component)
          - text: The todo content

          Note: No onToggle or onDelete callbacks are passed,
          so these sample items are not interactive.
      */}

      {/* ========================================
          SAMPLE TODO ITEM 1
          ========================================

          ToDoItem Component Instance
      */}
      <ToDoItem
        /**
         * id prop: Unique identifier
         *
         * Type: string
         * Required: Yes
         *
         * This MUST be unique across all items in the list.
         * React uses this key to:
         *   - Track which items have changed, been added, or been removed
         *   - Efficiently update the DOM (reconciliation)
         *   - Maintain component state between renders
         *   - Enable drag-and-drop (in @dnd-kit)
         *
         * Key Best Practices:
         *   - Must be unique among siblings
         *   - Should be stable (not randomly generated on each render)
         *   - Good: Database ID, timestamp-based ID, slug
         *   - Bad: Array index (can cause issues with reordering)
         *
         * This is a hardcoded string for the static sample.
         * In dynamic lists, use: id={todo.id}
         *
         * Note: This id is NOT the same as the React key!
         * We're not using a list with .map(), so we don't need keys here.
         * But the ToDoItem component still needs an id for its internal logic.
         */
        id="sample-1"

        /**
         * isDarkMode prop: Theme setting
         *
         * Type: boolean (optional)
         * Default: true
         *
         * This prop controls the visual theme of the todo item.
         * When isDarkMode is true:
         *   - Background: Dark (#25273D)
         *   - Text: Light color (#C8CBE7)
         *   - Borders: Dark color (#393A5A)
         *
         * When isDarkMode is false:
         *   - Background: Light (#FFFFFF)
         *   - Text: Dark color (#494C6B)
         *   - Borders: Light color (#E0E0E0)
         *
         * We're passing the isDarkMode value that this component received.
         * This is called PROP DRILLING - relaying props down to children.
         */
        isDarkMode={isDarkMode}

        /**
         * text prop: Todo content
         *
         * Type: string (optional)
         * Default: "Sample To-Do Item"
         *
         * This is the actual text content of the todo item.
         * It's what users see and interact with.
         *
         * The ToDoItem component will display this text,
         * style it responsively, and allow users to drag from it.
         *
         * Examples of good todo text:
         *   ✅ "Complete online JavaScript course"
         *   ✅ "Jogging for 20 minutes"
         *   ✅ "Finish the assignment"
         *
         * Examples of bad todo text:
         *   ❌ "todo" (too vague)
         *   ❌ "stuff" (not actionable)
         *   ❌ "" (empty - no content)
         */
        text="Complete online JavaScript course"
      />

      {/* ========================================
          SAMPLE TODO ITEM 2
          ========================================

          Another ToDoItem instance with different content.
          This demonstrates REUSABILITY - using the same component
          multiple times with different props to get different results.
      */}
      <ToDoItem
        /**
         * Different ID (must be unique)
         *
         * Each todo item needs a unique identifier.
         * Even though these are static samples, we still give them
         * unique IDs to follow best practices.
         *
         * In a dynamic app with drag-and-drop, unique IDs are critical
         * for the drag-and-drop library to track items correctly.
         */
        id="sample-2"

        /**
         * Same theme setting
         *
         * We pass the same isDarkMode value to all items.
         * This keeps the entire list visually consistent.
         *
         * If you wanted individual items to have different themes,
         * you could pass different isDarkMode values to each:
         *   <ToDoItem isDarkMode={true} ... />
         *   <ToDoItem isDarkMode={false} ... />
         *
         * But that would look unusual and is not recommended.
         */
        isDarkMode={isDarkMode}

        /**
         * Different text content
         *
         * This todo has completely different text, but it's rendered
         * using the exact same ToDoItem component.
         *
         * This demonstrates the power of component-based architecture:
         *   - Write the component once
         *   - Reuse it many times with different props
         *   - Maintain consistency across the app
         *   - Make updates in one place
         *
         * If we want to change how all todos look, we only need to
         * update the ToDoItem component, not every individual usage.
         */
        text="Jogging for 20 minutes"
      />

      {/* ========================================
          SAMPLE TODO ITEM 3
          ========================================

          The final sample todo item.
          This completes our static demo list of three items.
      */}
      <ToDoItem
        /**
         * Unique ID for the third item
         *
         * Using a descriptive ID prefix (sample-) makes it clear
         * that these are not real, persistent todo items.
         *
         * In a production app with a database, IDs might look like:
         *   - "todo_1704067200000" (timestamp-based)
         *   - "abc123-def456-ghi789" (UUID)
         *   - "user_123_todo_456" (composite ID)
         */
        id="sample-3"

        /**
         * Theme setting (consistent across all items)
         *
         * All three items use the same isDarkMode value.
         * This creates a visually cohesive list.
         */
        isDarkMode={isDarkMode}

        /**
         * Third unique todo text
         *
         * Each sample demonstrates a different type of task:
         *   1. Learning: "Complete online JavaScript course"
         *   2. Health: "Jogging for 20 minutes"
         *   3. Work: "Finish the assignment"
         *
         * Variety in samples helps users understand the range of
         * content the todo app can handle.
         */
        text="Finish the assignment"
      />

      {/* ========================================
          NOTE ON KEYS
          ========================================

          Wait, where are the React keys?

          In this static implementation, we're NOT using .map() to render
          a list from an array. We're explicitly writing out each item.

          React keys are ONLY required when using .map(), .filter(), or
          other array methods to dynamically generate components.

          Example where keys ARE required:
          ```
          {todos.map((todo) => (
            <ToDoItem key={todo.id} {...todo} />
          ))}
          ```

          Example where keys are NOT required (this code):
          ```
          <ToDoItem id="1" text="First" />
          <ToDoItem id="2" text="Second" />
          <ToDoItem id="3" text="Third" />
          ```

          However, in a production app, you would almost always use
          the .map() pattern to render dynamic lists from data.

          Dynamic implementation (better):
          ```
          interface ToDoListProps {
            todos: Todo[];  // Array of todo objects
            isDarkMode?: boolean;
          }

          export function ToDoList({ todos, isDarkMode = true }: ToDoListProps) {
            return (
              <div className="flex flex-col items-center" style={{ gap: "0" }}>
                {todos.map((todo) => (
                  <ToDoItem
                    key={todo.id}        // React key (required for list rendering)
                    id={todo.id}         // ToDoItem prop
                    isDarkMode={isDarkMode}
                    text={todo.text}
                    completed={todo.completed}
                    onToggle={() => onToggle(todo.id)}
                    onDelete={() => onDelete(todo.id)}
                  />
                ))}
              </div>
            );
          }
          ```

          The dynamic version:
          - Accepts todos as a prop (not hardcoded)
          - Uses .map() to render each todo
          - Includes a key prop for React
          - Passes callback functions for interactivity
          - Can handle any number of todos (0 to infinity)
      */}
    </div>
  );
}

/**
 * ========================================
 * SUMMARY OF REACT CONCEPTS
 * ========================================
 *
 * This component demonstrates several fundamental React concepts:
 *
 * 1. COMPONENT COMPOSITION
 *    - Building complex UIs from simple components
 *    - ToDoList is composed of multiple ToDoItem components
 *    - Each component has a single responsibility
 *
 * 2. PROPS PASSING
 *    - Parent passes data to children via props
 *    - Props are read-only (immutable)
 *    - Props flow one way (down the component tree)
 *
 * 3. PROP DRILLING
 *    - Passing props through intermediate components
 *    - isDarkMode is passed from ToDoList to ToDoItem
 *    - Alternative: React Context (avoid deep prop drilling)
 *
 * 4. JSX SYNTAX
 *    - HTML-like syntax in JavaScript
 *    - Compiled to React.createElement() calls
 *    - Makes code more readable
 *
 * 5. REUSABILITY
 *    - Write component once, use many times
 *    - Each instance can have different props
 *    - Changes to component affect all instances
 *
 * 6. STATIC vs DYNAMIC RENDERING
 *    - Static: Hardcoded items (this file)
 *    - Dynamic: Render from data array (production approach)
 *    - Dynamic requires .map() and React keys
 *
 * 7. TYPE SAFETY (TypeScript)
 *    - Interface defines component props
 *    - Type checking catches errors at compile time
 *    - Better developer experience with IDE autocomplete
 *
 * Next Steps for Production Use:
 * - Replace static items with dynamic .map() rendering
 * - Add callback props for interactivity (onToggle, onDelete)
 * - Accept todos array as prop instead of hardcoding
 * - Add drag-and-drop context wrapper
 * - Implement loading and error states
 * - Add tests for component behavior
 */
