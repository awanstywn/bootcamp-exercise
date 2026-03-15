/**
 * App — Root component that composes the full page layout.
 *
 * Responsibilities:
 * - Reads theme from Zustand store and selects appropriate colors/images
 * - Renders the banner (background image + gradient overlay)
 * - Composes all child components: Header, TodoInput, Search, TodoList, TodoFooter
 * - MobileFilterBar renders separately below the card on mobile
 */

import AppShell from "./components/layout/AppShell";
import { Header } from "./components/Header";
import TodoInput from "./components/todo/TodoInput";
import { Search } from "./components/Search";
import TodoList from "./components/todo/TodoList";
import TodoFooter from "./components/todo/TodoFooter";
import { MobileFilterBar } from "./components/todo/TodoFooter";

import "./App.css";

import darkBg from "./assets/dark-bg.png";
import lightBg from "./assets/light-bg.png";

import useTodoStore from "./store/useTodoStore";

function App() {
  // Read the current theme from the global Zustand store
  // isDarkMode is a boolean: true = dark mode, false = light mode
  const { isDarkMode } = useTodoStore();

  // Select theme-dependent resources using ternary operators:
  // condition ? valueIfTrue : valueIfFalse
  const bannerImage = isDarkMode ? darkBg : lightBg;
  const gradientColors = isDarkMode
    ? "linear-gradient(#3710BD, #A42395)"   // Purple gradient for dark mode
    : "linear-gradient(#5596FF, #AC2DEB)";  // Blue-purple gradient for light mode
  const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

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
              <TodoList />    {/* Renders filtered/sorted todo items with DnD support */}
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

export default App;
