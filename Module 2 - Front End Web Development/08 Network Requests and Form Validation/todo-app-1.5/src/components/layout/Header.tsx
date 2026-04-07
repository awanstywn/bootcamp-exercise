/**
 * Objective: Global header containing the app title, theme toggle, and user profile menu.
 *
 * How it works:
 * - Theme Toggle: Subscribes to `useTodoStore` to toggle between dark and light modes.
 * - Burger Menu: Toggles locally-managed state (`menuOpen`) to slide in a side-panel overlay.
 * - Side-Panel: Displays the logged-in user's name and email from `useAuthStore` and provides a logout control.
 * - Accessibility/UX: The overlay auto-locks body scroll and can be cleanly dismissed via close button, backdrop click, or the Escape key.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useTodoStore from "../../store/useTodoStore";
import useAuthStore from "../../store/useAuthStore";
import type { HeaderProps, AuthStore } from "../../types/types";

export function Header({ isDarkMode }: HeaderProps) {
  // Get the theme toggle function from the todo store
  const { toggleTheme } = useTodoStore();

  // Get user data and logout function from the auth store
  // `user` is either a BackendlessUser or null (not logged in)
  const user = useAuthStore((s: AuthStore) => s.user);
  const logout = useAuthStore((s: AuthStore) => s.logout);

  // React Router hook — allows us to programmatically redirect the user
  const navigate = useNavigate();

  // ── Overlay State ───────────────────────────────────
  // `menuOpen` controls whether the slide-in panel is visible or hidden.
  // - true  = overlay is showing (panel slides in, backdrop appears)
  // - false = overlay is hidden  (panel slides out, backdrop disappears)
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Keyboard Handler ────────────────────────────────
  // useCallback memoizes this function so it doesn't get re-created on every render.
  // This is important because we add/remove it as an event listener in useEffect.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // When the user presses Escape, close the overlay
      if (e.key === "Escape") setMenuOpen(false);
    },
    [] // Empty dependency array = function never changes
  );

  // ── Side Effect: Manage Overlay Behavior ────────────
  // This useEffect runs every time `menuOpen` changes.
  // It handles two things:
  //   1. Adding/removing the Escape key listener
  //   2. Locking/unlocking body scroll (prevents scrolling behind the overlay)
  useEffect(() => {
    if (menuOpen) {
      // Overlay just opened → start listening for Escape key
      document.addEventListener("keydown", handleKeyDown);
      // Lock body scroll so user can't scroll the page behind the overlay
      document.body.style.overflow = "hidden";
    } else {
      // Overlay just closed → restore normal scroll behavior
      document.body.style.overflow = "";
    }

    // Cleanup function — runs when component unmounts OR before next effect run.
    // This prevents memory leaks by removing the event listener.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen, handleKeyDown]); // Re-run when menuOpen or handleKeyDown changes

  // ── Logout Handler ──────────────────────────────────
  // 1. Close the overlay first (so the animation plays)
  // 2. Clear auth state (removes user data from the store)
  // 3. Redirect to the sign-in page (replace: true means user can't go "back")
  const handleLogout = () => {
    setMenuOpen(false);    // Step 1: close overlay
    logout();              // Step 2: clear user from store
    navigate("/signin", { replace: true }); // Step 3: redirect to /signin
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HEADER BAR — Always visible at the top of the page
          ══════════════════════════════════════════════════════ */}
      <header className="relative w-full max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 mb-8 sm:mb-10 mt-0">

        {/* ── App Title ── */}
        <h1
          className="text-4xl sm:text-5xl md:text-5xl font-bold text-white tracking-wider"
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            letterSpacing: "15px",
          }}
        >
          TODO
        </h1>

        {/* ── Right Side Controls ── */}
        {/* Contains the theme toggle and burger menu button side by side */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Theme Toggle Button — switches between dark mode (sun) and light mode (moon) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center cursor-pointer transition-all hover:scale-110 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-transparent p-0 shrink-0 border-none outline-none focus:outline-none"
            aria-label="Toggle theme"
          >
            {/* Conditional rendering: show sun icon in dark mode, moon icon in light mode */}
            {isDarkMode ? (
              /* Sun icon — shown when dark mode is active (clicking switches to light) */
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
              /* Moon icon — shown when light mode is active (clicking switches to dark) */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* ── Burger Menu Button (☰) ──
              This is just a button with 3 horizontal lines.
              When clicked, it sets `menuOpen` to true, which triggers:
              1. The backdrop to fade in (opacity 0 → 1)
              2. The panel to slide in from the right (translateX(100%) → translateX(0))
          */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center cursor-pointer transition-all hover:scale-110 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-transparent p-0 shrink-0 border-none outline-none focus:outline-none"
            aria-label="Open menu"
            id="burger-menu-btn"
          >
            {/* Three horizontal lines SVG = classic hamburger menu icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          OVERLAY — Only visible when menuOpen is true
          Made up of two layers: backdrop + panel
          ══════════════════════════════════════════════════════ */}

      {/* ── Layer 1: Backdrop ──
          A full-screen dark overlay that sits behind the panel.
          - When `menuOpen` is true  → class "open" is added → opacity becomes 1
          - When `menuOpen` is false → class "open" is removed → opacity becomes 0
          - Clicking on it closes the menu (acts as a "click outside to close" area)
          - pointer-events: none/auto ensures clicks pass through when hidden
      */}
      <div
        className={`menu-overlay-backdrop ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Layer 2: Slide-in Panel ──
          The actual side panel that shows user profile + logout.
          - Positioned fixed at the right edge of the viewport
          - Uses CSS transform to slide in/out:
            • Hidden state: translateX(100%)  → pushed completely off-screen to the right
            • Visible state: translateX(0)     → slides into view
          - The "open" class toggles between these two transform values
      */}
      <div
        className={`menu-overlay-panel ${menuOpen ? "open" : ""}`}
        role="dialog"
        aria-label="User menu"
        id="user-menu-panel"
      >
        {/* Close button (✕) — positioned at top-right corner of the panel */}
        <button
          onClick={() => setMenuOpen(false)}
          className="menu-overlay-close"
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* ── User Avatar Circle ──
            Displays the first letter of the user's name inside a purple gradient circle.
            Uses optional chaining in case user is null.
        */}
        <div className="menu-overlay-avatar">
          {user ? user.name.charAt(0).toUpperCase() : "?"}
        </div>

        {/* ── User Info ──
            Shows the user's name and email.
            The `user &&` check ensures this block only renders when someone is logged in.
        */}
        {user && (
          <div className="menu-overlay-user-info">
            <span className="menu-overlay-name">{user.name}</span>
            <span className="menu-overlay-email">{user.email}</span>
          </div>
        )}

        {/* Horizontal divider line — separates user info from the logout button */}
        <hr className="menu-overlay-divider" />

        {/* ── Logout Button ──
            When clicked, it calls handleLogout() which:
            1. Closes the overlay
            2. Clears auth state
            3. Redirects to /signin
        */}
        <button
          onClick={handleLogout}
          className="menu-overlay-logout"
          id="menu-logout-btn"
        >
          {/* Sign-out icon (door with arrow) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign out
        </button>
      </div>
    </>
  );
}
