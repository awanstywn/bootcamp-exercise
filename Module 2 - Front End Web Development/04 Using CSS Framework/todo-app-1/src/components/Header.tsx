/**
 * ========================================
 * HEADER COMPONENT
 * ========================================
 *
 * Purpose: Displays the app title and theme toggle button
 *
 * Props:
 *   - isDarkMode: Current theme state (true = dark, false = light)
 *   - toggleTheme: Function to toggle between dark and light themes
 *
 * Features:
 *   - Responsive layout that adapts to screen size
 *   - Theme toggle button with animated icons (sun/moon)
 *   - Custom typography with letter spacing
 */

// ========================================
// TYPE DEFINITION
// ========================================

/**
 * Interface defining the props that Header component accepts
 * This ensures type safety - only these props with these types can be passed
 */
interface HeaderProps {
  isDarkMode: boolean;     // Current theme: true = dark mode, false = light mode
  toggleTheme: () => void;  // Function called when user clicks theme toggle button
}

// ========================================
// COMPONENT
// ========================================

export function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  // Return JSX (React's HTML-like syntax) to describe the UI
  return (
    <header
      // Tailwind CSS classes for responsive layout:
      // - relative: enable positioning context for children
      // - w-full: take full width of parent
      // - max-w-2xl: maximum width of 42rem (672px), centers content
      // - mx-auto: horizontal margin auto (centers the header)
      // - flex: use flexbox layout
      // - items-center: vertically align children
      // - justify-between: space between title and button
      // - px-4: horizontal padding on mobile
      // - sm:px-6: horizontal padding on screens >= 640px
      className="relative w-full max-w-2xl mx-auto header flex items-center justify-between px-4 sm:px-6 mb-8 sm:mb-10"
      style={{ height: "auto", marginTop: "0px" }}
    >
      {/* ========================================
          APP TITLE SECTION
          ======================================== */}
      <h1
        // Tailwind classes for responsive typography:
        // - text-4xl: 36px font size on mobile
        // - sm:text-5xl: 48px font size on screens >= 640px
        // - md:text-5xl: 48px font size on screens >= 768px
        // - font-bold: bold font weight
        // - text-white: white text color
        // - tracking-wider: increased letter spacing
        className="text-4xl sm:text-5xl md:text-5xl font-bold text-white tracking-wider"
        style={{
          fontFamily: "Josefin Sans, sans-serif", // Use custom font
          fontWeight: "700",                        // Extra bold weight
          letterSpacing: "15px",                   // Wide letter spacing
        }}
      >
        TODO
      </h1>

      {/* ========================================
          THEME TOGGLE BUTTON
          ======================================== */}
      <button
        // Event handler: calls toggleTheme when clicked
        onClick={toggleTheme}

        // Tailwind classes for button styling:
        // - flex: use flexbox to center icon
        // - items-center, justify-center: center icon vertically and horizontally
        // - cursor-pointer: show pointer cursor on hover
        // - transition-all: smooth transition for all style changes
        // - hover:scale-110: scale to 110% on hover (zoom effect)
        // - w-8 h-8: 32px size on mobile
        // - sm:w-7 sm:h-7: 28px size on screens >= 640px
        className="flex items-center justify-center cursor-pointer transition-all hover:scale-110 theme-toggle-btn w-8 h-8 sm:w-7 sm:h-7"

        // Inline styles for button appearance
        style={{
          border: "none",             // Remove default button border
          borderRadius: "50%",        // Make button circular
          backgroundColor: "transparent", // Transparent background
          padding: "0",               // Remove default padding
          flexShrink: 0,              // Prevent button from shrinking in flexbox
        }}

        // Accessibility: provides text description for screen readers
        aria-label="Toggle theme"
      >
        {/* ========================================
            CONDITIONAL ICON RENDERING
            ======================================== */}

        {/* Ternary operator: condition ? true : false
            If isDarkMode is true, render Sun Icon
            If isDarkMode is false, render Moon Icon
        */}
        {isDarkMode ? (
          // ========================================
          // SUN ICON (shown in dark mode)
          // ========================================
          <svg
            width="22"     // Icon width in pixels
            height="22"    // Icon height in pixels
            viewBox="0 0 24 24"  // Coordinate system: 0,0 to 24,24
            fill="none"     // No fill color
            stroke="white"  // White stroke color
            strokeWidth="2"  // Stroke thickness
            strokeLinecap="round"   // Rounded line ends
            strokeLinejoin="round"  // Rounded line corners
          >
            {/* Circle - sun's center */}
            <circle cx="12" cy="12" r="5"></circle>

            {/* Top ray */}
            <line x1="12" y1="1" x2="12" y2="3"></line>

            {/* Bottom ray */}
            <line x1="12" y1="21" x2="12" y2="23"></line>

            {/* Top-left diagonal ray */}
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>

            {/* Bottom-right diagonal ray */}
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>

            {/* Left ray */}
            <line x1="1" y1="12" x2="3" y2="12"></line>

            {/* Right ray */}
            <line x1="21" y1="12" x2="23" y2="12"></line>

            {/* Bottom-left diagonal ray */}
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>

            {/* Top-right diagonal ray */}
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          // ========================================
          // MOON ICON (shown in light mode)
          // ========================================
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
            {/* Path - crescent moon shape */}
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    </header>
  );
}
