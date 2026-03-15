/**
 * ========================================
 * MAIN APP COMPONENT
 * ========================================
 *
 * This is the root component of the Todo application. It manages all the state
 * and coordinates the child components to create a fully functional todo app.
 *
 * Features:
 * - Add, edit, delete, and toggle completion of todos
 * - Filter todos by All/Active/Completed
 * - Drag and drop to reorder todos
 * - Dark/Light theme switching
 * - Responsive design (desktop & mobile)
 *
 * Key Concepts:
 * - React Hooks (useState, useEffect) for state management
 * - @dnd-kit library for drag-and-drop functionality
 * - CSS-in-JS with inline styles
 * - Conditional rendering based on theme and filter state
 */

// ========================================
// IMPORTS
// ========================================
// React hooks for state management and side effects
import { useState, useEffect } from "react";

// Child components
import { Header } from "./components/Header";
import { ToDoInput } from "./components/ToDoInput";
import { ToDoItem } from "./components/ToDoItem";
import { FilterSort } from "./components/FilterSort";
import { Search } from "./components/Search";

// Global styles
import "./App.css";

// Background images for dark/light themes
import darkBg from "./assets/dark-bg.png";
import lightBg from "./assets/light-bg.png";

// Drag-and-drop library (@dnd-kit)
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Todo Interface
 * Defines the structure of a single todo item
 */
interface Todo {
  id: string; // Unique identifier (uses timestamp)
  text: string; // Todo description/content
  completed: boolean; // Completion status
}

/**
 * Filter Type
 * Defines the available filter options
 */
type FilterType = "all" | "active" | "completed";

// ========================================
// APP COMPONENT
// ========================================

function App() {
  // ========================================
  // STATE MANAGEMENT (React Hooks)
  // ========================================

  /**
   * useState Hook: Creates state variables that trigger re-renders when changed
   * Syntax: const [stateValue, setStateFunction] = useState(initialValue)
   */

  // Theme state: true = dark mode, false = light mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Todos state: Array of todo objects (starts with 3 sample todos)
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Complete online JavaScript course", completed: false },
    { id: "2", text: "Jogging for 20 minutes", completed: false },
    { id: "3", text: "Finish the assignment", completed: false },
  ]);

  // Filter state: Which filter is currently active
  const [filter, setFilter] = useState<FilterType>("all");

  // Sort state: Sort order (oldest to newest or newest to oldest)
  const [sort, setSort] = useState<"oldest" | "newest">("oldest");

  // Search state: Search term for filtering todos by text
  const [searchTerm, setSearchTerm] = useState("");

  // ========================================
  // THEME MANAGEMENT
  // ========================================

  /**
   * useEffect Hook: Runs side effects when dependencies change
   * Syntax: useEffect(() => { effect }, [dependencies])
   *
   * This effect syncs the theme state to the DOM body element
   * by adding/removing CSS classes that change the app's appearance
   */
  useEffect(() => {
    if (isDarkMode) {
      // Add dark-mode class, remove light-mode class
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      // Add light-mode class, remove dark-mode class
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]); // Only re-run when isDarkMode changes

  /**
   * Theme Toggle Function
   * Flips the theme state between true and false
   */
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  /**
   * CREATE: Add a new todo
   * @param text - The todo description
   *
   * Creates a new todo object with:
   * - Unique ID (using current timestamp)
   * - The provided text
   * - completed: false (new todos are uncompleted)
   */
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(), // Use timestamp as unique ID
      text,
      completed: false,
    };
    // Spread operator creates new array with existing todos + new todo
    setTodos([...todos, newTodo]);
  };

  /**
   * UPDATE: Toggle todo completion status
   * @param id - The ID of the todo to toggle
   *
   * Uses .map() to create a new array where only the matching todo
   * has its 'completed' status flipped
   */
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        // If this is the todo we want to toggle, flip its completed status
        // Otherwise, return it unchanged
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  /**
   * DELETE: Remove a todo
   * @param id - The ID of the todo to delete
   *
   * Uses .filter() to create a new array excluding the deleted todo
   */
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  /**
   * DELETE MULTIPLE: Clear all completed todos
   *
   * Uses .filter() to keep only uncompleted todos
   */
  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  /**
   * UPDATE: Edit a todo's text content
   * @param id - The ID of the todo to update
   * @param newText - The new text for the todo
   *
   * Uses .map() to create a new array where only the matching todo
   * has its text updated. Other todos remain unchanged.
   */
  const updateTodo = (id: string, newText: string) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)),
    );
  };

  // ========================================
  // DRAG AND DROP FUNCTIONALITY
  // ========================================

  /**
   * Handle Drag End Event
   * @param event - Drag event from @dnd-kit library
   *
   * This function is called when a user finishes dragging a todo item.
   * It reorders the todos array based on where the item was dropped.
   *
   * Process:
   * 1. Get the dragged item (active) and drop target (over)
   * 2. Find their current positions in the array
   * 3. Remove from old position, insert at new position
   * 4. Update state with reordered array
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event; // active = dragged item, over = drop target

    // Only reorder if dropped on a different position
    if (over && active.id !== over.id) {
      setTodos((items) => {
        // Find current index of dragged item
        const oldIndex = items.findIndex(
          (item) => item.id === String(active.id),
        );
        // Find new index (where it was dropped)
        const newIndex = items.findIndex((item) => item.id === String(over.id));

        // Create a copy of the array
        const newItems = [...items];
        // Remove item from old position
        const [removed] = newItems.splice(oldIndex, 1);
        // Insert item at new position
        newItems.splice(newIndex, 0, removed);

        return newItems;
      });
    }
  };

  // ========================================
  // FILTERING LOGIC
  // ========================================

  /**
   * Get Filtered Todos
   * Returns a filtered list based on the current filter state, search term, and sort order
   *
   * Filtering process (in order):
   * 1. Filter by status: "all", "active", or "completed"
   * 2. Filter by search term (only if user has typed 3+ characters - case insensitive)
   * 3. Sort by creation date: "oldest" or "newest"
   */
  const getFilteredTodos = () => {
    let filtered;

    // Step 1: Filter by status
    switch (filter) {
      case "active":
        filtered = todos.filter((todo) => !todo.completed);
        break;
      case "completed":
        filtered = todos.filter((todo) => todo.completed);
        break;
      default:
        filtered = todos;
    }

    // Step 2: Filter by search term (only if 3+ characters)
    if (searchTerm.trim().length >= 3) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((todo) =>
        todo.text.toLowerCase().includes(lowerSearchTerm),
      );
    }

    // Step 3: Sort by creation date (ID contains timestamp from Date.now())
    return filtered.sort((a, b) => {
      const aTime = Number(a.id);
      const bTime = Number(b.id);
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  };

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Count uncompleted todos for the "X items left" text
  const activeItemsCount = todos.filter((todo) => !todo.completed).length;

  // Choose background image based on theme
  const bannerImage = isDarkMode ? darkBg : lightBg;

  // Choose gradient colors based on theme
  const gradientColors = isDarkMode
    ? "linear-gradient(#3710BD, #A42395)" // Dark theme: purple gradient
    : "linear-gradient(#5596FF, #AC2DEB)"; // Light theme: blue gradient

  // Choose background color based on theme
  const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

  // ========================================
  // RENDER: JSX (HTML-like markup)
  // ========================================

  return (
    // Main app container with full viewport height
    <div
      className="app-container min-h-screen w-full relative flex flex-col items-center"
      style={{ backgroundColor }}
    >
      {/* ========================================
          BANNER SECTION
          Background image with gradient overlay
          ======================================== */}
      <div
        className="banner-area absolute top-0 left-0 right-0 w-full"
        style={{ height: "300px", overflow: "hidden", zIndex: 0 }}
      >
        {/* Background image layer */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "960px",
            top: "-310px", // Negative top positions image higher up
            left: "0",
            right: "0",
            opacity: "1",
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Gradient overlay layer (adds color tint on top of image) */}
        <div
          className="absolute inset-0"
          style={{ background: gradientColors, opacity: "0.7" }}
        />
      </div>

      {/* ========================================
          MAIN CONTENT SECTION
          ======================================== */}
      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{ marginTop: "70px" }}
      >
        {/* Header: Title and theme toggle button */}
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        {/* Main content wrapper */}
        <div className="flex flex-col items-center w-full px-4 sm:px-6 gap-6">
          {/* Input field for creating new todos */}
          <ToDoInput isDarkMode={isDarkMode} onAddTodo={addTodo} />
          {/* Search input */}
          <Search isDarkMode={isDarkMode} onSearch={setSearchTerm} />
          {/* ========================================
              TODO LIST CONTAINER
              Contains todos and filter controls
              ======================================== */}
          <div
            className="todo-container w-full max-w-2xl"
            style={{
              backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
              boxShadow: isDarkMode
                ? "0px 35px 50px -15px rgba(0, 0, 0, 0.5)"
                : "0px 35px 50px -15px rgba(194, 195, 214, 0.5)",
              borderTopLeftRadius: "5px",
              borderTopRightRadius: "5px",
              overflow: "hidden",
            }}
          >
            {/* ========================================
                DRAG AND DROP CONTEXT
                Wraps all draggable items
                ======================================== */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={getFilteredTodos().map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* ========================================
                    TODO ITEMS LIST
                    Maps through filtered todos and renders each one
                    ======================================== */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0" }}
                >
                  {getFilteredTodos().map((todo, index) => (
                    <ToDoItem
                      key={todo.id} // React key for efficient re-rendering
                      id={todo.id}
                      isDarkMode={isDarkMode}
                      text={todo.text}
                      completed={todo.completed}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => deleteTodo(todo.id)}
                      onUpdate={(newText) => updateTodo(todo.id, newText)}
                      isFirst={index === 0} // Round top corners on first item
                      isLast={index === getFilteredTodos().length - 1} // No border on last item
                    />
                  ))}
                </div>

                {/* ========================================
                    DESKTOP FILTER BAR
                    Shows counter, filter buttons, and clear button in one row
                    Hidden on mobile (shown via CSS)
                    ======================================== */}
                <div
                  className="todo-filter-bar-container"
                  style={{
                    width: "100%",
                    backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
                    borderTop: isDarkMode
                      ? "1px solid #393A5A"
                      : "1px solid #E0E0E0",
                    borderLeft: isDarkMode
                      ? "1px solid #393A5A"
                      : "1px solid #E0E0E0",
                    borderRight: isDarkMode
                      ? "1px solid #393A5A"
                      : "1px solid #E0E0E0",
                    borderBottom: "none",
                    display: "flex",
                    alignItems: "stretch",
                    flexDirection: "row",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "16px 20px",
                      gap: "12px",
                    }}
                  >
                    {/* Items left counter */}
                    <span
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "400",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        color: isDarkMode ? "#5B5E7E" : "#9495A5",
                      }}
                    >
                      {activeItemsCount} items left
                    </span>

                    {/* Filter buttons: All, Active, Completed */}
                    <div
                      className="desktop-filter-buttons"
                      style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        onClick={() => setFilter("all")}
                        style={{
                          fontFamily: "Josefin Sans, sans-serif",
                          fontWeight: "700",
                          fontSize: "clamp(12px, 2.5vw, 14px)",
                          lineHeight: "1.5",
                          letterSpacing: "-0.19px",
                          color:
                            filter === "all"
                              ? "#3A7CFD"
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
                        onClick={() => setFilter("active")}
                        style={{
                          fontFamily: "Josefin Sans, sans-serif",
                          fontWeight: "700",
                          fontSize: "clamp(12px, 2.5vw, 14px)",
                          lineHeight: "1.5",
                          letterSpacing: "-0.19px",
                          color:
                            filter === "active"
                              ? "#3A7CFD"
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
                        onClick={() => setFilter("completed")}
                        style={{
                          fontFamily: "Josefin Sans, sans-serif",
                          fontWeight: "700",
                          fontSize: "clamp(12px, 2.5vw, 14px)",
                          lineHeight: "1.5",
                          letterSpacing: "-0.19px",
                          color:
                            filter === "completed"
                              ? "#3A7CFD"
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

                    {/* Clear completed button */}
                    <button
                      onClick={clearCompleted}
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "400",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        textAlign: "right",
                        color: isDarkMode ? "#5B5E7E" : "#9495A5",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                    >
                      Clear Completed
                    </button>
                  </div>
                </div>

                {/* ========================================
                    MOBILE FILTER BAR
                    Split into 2 rows for better mobile UX
                    Hidden on desktop (shown via CSS media query)
                    ======================================== */}
                <div
                  className="todo-filter-bar-mobile"
                  style={{
                    width: "100%",
                    display: "none", // Hidden by default, shown on mobile via CSS
                    flexDirection: "column",
                    backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
                    borderTop: isDarkMode
                      ? "1px solid #393A5A"
                      : "1px solid #E0E0E0",
                    borderLeft: isDarkMode
                      ? "1px solid #393A5A"
                      : "1px solid #E0E0E0",
                    borderRight: isDarkMode
                      ? "1px solid #393A5A"
                      : "1px solid #E0E0E0",
                    borderBottom: "none",
                  }}
                >
                  {/* Row 1: Items left counter + Clear Completed button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderBottom: isDarkMode
                        ? "1px solid #393A5A"
                        : "1px solid #E0E0E0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "400",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        color: isDarkMode ? "#5B5E7E" : "#9495A5",
                      }}
                    >
                      {activeItemsCount} items left
                    </span>
                    <button
                      onClick={clearCompleted}
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "400",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        color: isDarkMode ? "#5B5E7E" : "#9495A5",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                    >
                      Clear Completed
                    </button>
                  </div>

                  {/* Row 2: Filter buttons centered */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "20px",
                      padding: "16px 20px",
                    }}
                  >
                    <button
                      onClick={() => setFilter("all")}
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "700",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        color:
                          filter === "all"
                            ? "#3A7CFD"
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
                      onClick={() => setFilter("active")}
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "700",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        color:
                          filter === "active"
                            ? "#3A7CFD"
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
                      onClick={() => setFilter("completed")}
                      style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontWeight: "700",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.5",
                        letterSpacing: "-0.19px",
                        color:
                          filter === "completed"
                            ? "#3A7CFD"
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
                </div>
              </SortableContext>
            </DndContext>

            {/* Gap between filter sections on mobile */}
            <div
              className="filter-gap-mobile"
              style={{ width: "100%", height: "16px", display: "none" }}
            />

            {/* ========================================
                MOBILE FILTER BUTTONS SECTION
                Separate container for mobile filter buttons
                Positioned below the main todo container
                ======================================== */}
            <div
              className="todo-filter-buttons-section"
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: isDarkMode ? "#25273D" : "#FFFFFF",
                borderLeft: isDarkMode
                  ? "1px solid #393A5A"
                  : "1px solid #E0E0E0",
                borderRight: isDarkMode
                  ? "1px solid #393A5A"
                  : "1px solid #E0E0E0",
                borderBottom: isDarkMode
                  ? "1px solid #393A5A"
                  : "1px solid #E0E0E0",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                borderTop: "none",
                display: "none", // Hidden by default, shown on mobile via CSS
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                padding: "12px 24px",
              }}
            >
              <button
                onClick={() => setFilter("all")}
                style={{
                  fontFamily: "Josefin Sans, sans-serif",
                  fontWeight: "700",
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "-0.19px",
                  color:
                    filter === "all"
                      ? "#3A7CFD"
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
                onClick={() => setFilter("active")}
                style={{
                  fontFamily: "Josefin Sans, sans-serif",
                  fontWeight: "700",
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "-0.19px",
                  color:
                    filter === "active"
                      ? "#3A7CFD"
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
                onClick={() => setFilter("completed")}
                style={{
                  fontFamily: "Josefin Sans, sans-serif",
                  fontWeight: "700",
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "-0.19px",
                  color:
                    filter === "completed"
                      ? "#3A7CFD"
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
          </div>
          {/* Add the filter and sort buttons component here */}
          <FilterSort
            isDarkMode={isDarkMode}
            filter={filter}
            sort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />
          {/* Drag hint text - tells users they can drag to reorder */}
          <div
            className="drag-hint"
            style={{
              fontFamily: "Josefin Sans, sans-serif",
              fontWeight: "400",
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "-0.19px",
              textAlign: "center",
              color: isDarkMode ? "#5B5E7E" : "#9495A5",
              marginTop: "49px",
              marginBottom: "52px",
            }}
          >
            Drag and drop to reorder list
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the App component as the default export
// This allows it to be imported as "import App from './App'"
export default App;
