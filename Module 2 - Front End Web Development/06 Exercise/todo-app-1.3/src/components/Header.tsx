/**
 * Header — App title ("TODO") and theme toggle button.
 * Displays a sun icon in dark mode and moon icon in light mode.
 */

import useTodoStore from "../store/useTodoStore";
import type { HeaderProps } from "../types/types";

export function Header({ isDarkMode }: HeaderProps) {
  const { toggleTheme } = useTodoStore();

  return (
    <header className="relative w-full max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 mb-8 sm:mb-10 mt-0">
      <h1
        className="text-4xl sm:text-5xl md:text-5xl font-bold text-white tracking-wider"
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          letterSpacing: "15px",
        }}
      >
        TODO
      </h1>

      {/* Theme toggle: sun (dark mode) / moon (light mode) */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center cursor-pointer transition-all hover:scale-110 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-transparent p-0 shrink-0 border-none outline-none focus:outline-none"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    </header>
  );
}
