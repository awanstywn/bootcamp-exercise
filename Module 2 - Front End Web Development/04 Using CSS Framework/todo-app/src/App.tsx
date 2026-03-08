import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ToDoInput } from "./components/ToDoInput";
import { ToDoItem } from "./components/ToDoItem";
import "./App.css";
import darkBg from "./assets/dark-bg.png";
import lightBg from "./assets/light-bg.png";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type FilterType = "all" | "active" | "completed";

function App() {
  // ====== STATE MANAGEMENT ======
  // Track current theme mode (true = dark, false = light)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Array of all todo items with initial sample data
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Complete online JavaScript course", completed: false },
    { id: "2", text: "Jogging for 20 minutes", completed: false },
    { id: "3", text: "Finish the assignment", completed: false },
  ]);

  // Track which filter view is active (all/active/completed)
  const [filter, setFilter] = useState<FilterType>("all");

  // ====== THEME MANAGEMENT ======
  // Sync theme mode to body element for CSS dark/light mode styling
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Add new todo
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  // Toggle todo completion
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  // Delete todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Clear completed
  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // Reorder todos (drag and drop)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id === String(active.id),
        );
        const newIndex = items.findIndex((item) => item.id === String(over.id));

        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);

        return newItems;
      });
    }
  };

  // Get filtered todos
  const getFilteredTodos = () => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  };

  // Count active items
  const activeItemsCount = todos.filter((todo) => !todo.completed).length;

  const bannerImage = isDarkMode ? darkBg : lightBg;
  const gradientColors = isDarkMode
    ? "linear-gradient(#3710BD, #A42395)"
    : "linear-gradient(#5596FF, #AC2DEB)";
  const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

  return (
    <div
      className="app-container min-h-screen w-full relative flex flex-col items-center"
      style={{ backgroundColor }}
    >
      {/* Banner area - Top 300px with background image and gradient */}
      <div
        className="banner-area absolute top-0 left-0 right-0 w-full"
        style={{
          height: "300px",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {/* Background Image - Full width */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "960px",
            top: "-310px",
            left: "0",
            right: "0",
            opacity: "1",
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Gradient Overlay - Only on banner area */}
        <div
          className="absolute inset-0"
          style={{
            background: gradientColors,
            opacity: "0.7",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{ marginTop: "70px" }}
      >
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="flex flex-col items-center w-full px-4 sm:px-6 gap-6">
          <ToDoInput isDarkMode={isDarkMode} onAddTodo={addTodo} />

          {/* Todo List Container */}
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
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={getFilteredTodos().map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* Todo Items */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0" }}
                >
                  {getFilteredTodos().map((todo, index) => (
                    <ToDoItem
                      key={todo.id}
                      id={todo.id}
                      isDarkMode={isDarkMode}
                      text={todo.text}
                      completed={todo.completed}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => deleteTodo(todo.id)}
                      isFirst={index === 0}
                      isLast={index === getFilteredTodos().length - 1}
                    />
                  ))}
                </div>

                {/* Filter Bar Section - Counter and Clear Completed */}
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
                  {/* Desktop Layout - all in one row */}
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

                {/* Mobile Layout - Two separate sections */}
                <div
                  className="todo-filter-bar-mobile"
                  style={{
                    width: "100%",
                    display: "none",
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
                  {/* Row 1: Counter and Clear Completed */}
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

                  {/* Row 2: Filter Buttons - Centered */}
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
              style={{
                width: "100%",
                height: "16px",
                display: "none",
              }}
            />

            {/* Filter Buttons Section - Mobile only - Outside todo-container */}
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
                display: "none",
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

export default App;
