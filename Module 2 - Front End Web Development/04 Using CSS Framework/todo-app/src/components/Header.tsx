/**
 * Header Component
 *
 * Purpose: Displays the "TODO" title and contains the theme toggle button
 *
 * Props:
 *   - isDarkMode (boolean): Current theme mode (true = dark, false = light)
 *   - toggleTheme (function): Callback to toggle between dark and light themes
 *
 * Features:
 *   - Responsive title with fluid font sizing using clamp()
 *   - Theme toggle button that shows sun icon in dark mode
 *   - Shows moon icon in light mode
 *   - Scales appropriately on different screen sizes
 */

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <header
      className="relative w-full max-w-2xl mx-auto header flex items-center justify-between px-4 sm:px-6 mb-8 sm:mb-10"
      style={{
        height: "auto",
        marginTop: "0px",
      }}
    >
      {/* Title - "TODO" text with responsive letter spacing */}
      <h1
        className="text-4xl sm:text-5xl md:text-5xl font-bold text-white tracking-wider"
        style={{
          fontFamily: "Josefin Sans, sans-serif",
          fontWeight: "700",
          letterSpacing: "15px",
        }}
      >
        TODO
      </h1>

      {/* Theme Toggle Button - Opens sun icon in dark mode, moon in light mode */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center cursor-pointer transition-all hover:scale-110 theme-toggle-btn w-8 h-8 sm:w-7 sm:h-7"
        style={{
          border: "none",
          borderRadius: "50%",
          backgroundColor: "transparent",
          padding: "0",
          flexShrink: 0,
        }}
        aria-label="Toggle theme"
      >
        {/* Conditionally render sun icon in dark mode or moon icon in light mode */}
        {isDarkMode ? (
          // Sun Icon SVG - Displayed when in dark mode to allow switching to light
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          // Moon Icon SVG - Displayed when in light mode to allow switching to dark
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    </header>
  );
}
