/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: pages/TodoPage.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   The primary dashboard page of the application.
 *   Composes the core Todo features, analytics, and navigation elements.
 *
 * RELATIONS:
 *   - App.tsx             → Protected route that renders this page.
 *   - store/useTodoStore.ts → Fetches and provides the main list of tasks.
 *   - store/useAuthStore.ts → Provides current user information.
 *   - services/analyticsService.ts → Fetches productivity statistics.
 *   - components/*        → All visual building blocks (Header, List, Analytics).
 *
 * HOW IT WORKS:
 *   1. Lifecycle: On mount, it triggers 'fetchTodos' from the store.
 *   2. Analytics: Fetches daily trends and summary data via the analytics service.
 *   3. Theme Sync: Dynamically calculates background banners and gradients 
 *      based on the current dark/light mode preference.
 *   4. Composition: Wraps the entire layout in 'AppShell' for consistent styling.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect } from "react";
import AppShell from "../components/layout/AppShell";
import { Header } from "../components/layout/Header";
import { TodoInput } from "../components/todo/TodoInput";
import { Search } from "../components/controls/Search";
import TodoList from "../components/todo/TodoList";
import TodoFooter from "../components/todo/TodoFooter";
import { MobileFilterBar } from "../components/todo/TodoFooter";

import darkBg from "../assets/dark-bg.png";
import lightBg from "../assets/light-bg.png";

// --- Global State ---
import useTodoStore from "../store/useTodoStore";
import useAuthStore from "../store/useAuthStore";

// --- Services & Types ---


export default function TodoPage() {
  // --- STORE EXTRACTION ---
  const isDarkMode = useTodoStore((s) => s.isDarkMode);
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const isLoading = useTodoStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);



  // --- THEME CALCULATIONS ---
  const bannerImage = isDarkMode ? darkBg : lightBg;
  const gradientColors = isDarkMode
    ? "linear-gradient(#3710BD, #A42395)"
    : "linear-gradient(#5596FF, #AC2DEB)";
  const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

  // --- SIDE EFFECTS ---
  useEffect(() => {
    // Backend identifies user from JWT token, no ownerId param needed
    if (user && user.id) {
      fetchTodos();


    }
  }, [user, fetchTodos]);

  return (
    <AppShell>
      <div
        className="app-container min-h-screen w-full relative flex flex-col items-center"
        style={{ backgroundColor }}
      >
        {/* Banner Area */}
        <div
          className="banner-area absolute top-0 left-0 right-0 w-full"
          style={{ height: "300px", overflow: "hidden", zIndex: 0 }}
        >
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
          <div
            className="absolute inset-0"
            style={{ background: gradientColors, opacity: "0.7" }}
          />
        </div>

        {/* Main Content Composition */}
        <div
          className="relative z-10 flex flex-col items-center w-full"
          style={{ marginTop: "70px" }}
        >
          <Header isDarkMode={isDarkMode} />

          <div className="flex flex-col w-full px-4 sm:px-6 gap-4 items-center max-w-2xl mx-auto" style={{ marginTop: '32px' }}>
            <TodoInput />
            <Search />

            {/* Main Todo Card */}
            <div
              className="todo-container w-full flex flex-col bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200"
              style={{ borderRadius: "5px", overflow: "hidden" }}
            >
              {isLoading ? (
                <p className="p-6 text-center text-[#9495A5] dark:text-[#5B5E7E]">Loading tasks...</p>
              ) : (
                <TodoList />
              )}
              <TodoFooter />
            </div>

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
