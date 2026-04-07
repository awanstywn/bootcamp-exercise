import { useEffect } from "react";
// 1. Layout & Components Imports
import AppShell from "../components/layout/AppShell";
import { Header } from "../components/layout/Header";
import { TodoInput } from "../components/todo/TodoInput";
import {Search} from "../components/controls/Search";
import TodoList from "../components/todo/TodoList";
import TodoFooter from "../components/todo/TodoFooter";
import { MobileFilterBar } from "../components/todo/TodoFooter";
import darkBg from "../assets/dark-bg.png";
import lightBg from "../assets/light-bg.png";

// 2. Global State (Zustand) Imports
import useTodoStore from "../store/useTodoStore";
import useAuthStore from "../store/useAuthStore";

/**
 * Objective: The main dashboard page of the Todo application.
 * What it does:
 * - Composes the entire Todo interface (Header, Input, List, Footer).
 * - Automatically fetches the user's tasks from the backend on load.
 * - Handles the visual background banner (dark/light themes).
 */
export default function TodoPage() {
  // --- STATE EXTRACTION ---
  // Subscribing to specific global state properties
  const isDarkMode = useTodoStore((s) => s.isDarkMode);
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const isLoading = useTodoStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

   // Select theme-dependent resources using ternary operators:
  // condition ? valueIfTrue : valueIfFalse
  const bannerImage = isDarkMode ? darkBg : lightBg;
  const gradientColors = isDarkMode
    ? "linear-gradient(#3710BD, #A42395)"   // Purple gradient for dark mode
    : "linear-gradient(#5596FF, #AC2DEB)";  // Blue-purple gradient for light mode
  const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

  // --- SIDE EFFECTS ---
  // Runs automatically when the component mounts or when dependencies change.
  useEffect(() => {
    // If the user object exists and has an ID, fetch their tasks from the backend.
    if (user && user.objectId) {
      fetchTodos(user.objectId);
    }
  }, [user, fetchTodos]);

  // --- UI RENDERING ---
  return (
    // AppShell wraps everything → applies the "dark" CSS class when isDarkMode is true
    <AppShell>
      {/* Main container: position: relative so children can use absolute positioning */}
      <div
        className="app-container min-h-screen w-full relative flex flex-col items-center"
        style={{ backgroundColor }}
      >
        {/* Banner: two layers stacked with absolute positioning */}
        {/* zIndex: 0 = behind content; height: 300px = only covers top portion */}
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
          {/* Gradient overlay layer */}
          <div
            className="absolute inset-0"
            style={{ background: gradientColors, opacity: "0.7" }}
          />
        </div>

        {/* Main content: z-10 = above the banner (z-0), so content floats over the image */}
        <div
          className="relative z-10 flex flex-col items-center w-full"
          style={{ marginTop: "70px" }}
        >
          {/* Pass isDarkMode as prop so Header can show the correct icon */}
          <Header isDarkMode={isDarkMode} />

          {/* max-w-2xl = content max width ~672px; mx-auto = centered horizontally */}
          <div className="flex flex-col w-full px-4 sm:px-6 gap-4 items-center max-w-2xl mx-auto" style={{ marginTop: '32px' }}>
            <TodoInput />
            <Search />

            {/* Todo card: wraps both the task list and footer in one card */}
            {/* overflow: hidden ensures child borders don't leak outside rounded corners */}
            <div
              className="todo-container w-full flex flex-col bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200"
              style={{ borderRadius: "5px", overflow: "hidden" }}
            >
              {/* Conditional Rendering: Show loading text or the actual Todo list */}
              {isLoading ? (
                <p className="p-6 text-center text-[#9495A5] dark:text-[#5B5E7E]">Loading tasks...</p>
              ) : (
                <TodoList />
              )}
              <TodoFooter />  {/* Shows items count + filter tabs (desktop) + clear button */}
            </div>

            {/* MobileFilterBar: renders filter tabs in a separate card, only visible on <640px */}
            <MobileFilterBar />

            <p className="mt-8 text-sm text-center" style={{
              color: isDarkMode ? "#5B5E7E" : "#9495A5",
              fontFamily: "Josefin Sans, sans-serif"
            }}>
              Drag and drop to reorder list
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
