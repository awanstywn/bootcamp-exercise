/**
 * SignIn — Full-page sign-in form styled to match the Todo page layout.
 *
 * Layout structure (same as TodoPage):
 * ─────────────────────────────────────
 * 1. AppShell wrapper → applies `.dark` class for Tailwind dark: variants
 * 2. Banner area at the top → background image + purple gradient overlay
 * 3. Content floated on top (z-10) → "SIGN IN" title + theme toggle + form card
 *
 * Features:
 * - Collects name and email → stores as RegularUser in auth Zustand store
 * - "Continue as Guest" option → stores as GuestUser
 * - Theme toggle (sun/moon icon) → switches between light and dark mode
 * - Same banner images and gradient colors as the Todo page
 *
 * All styling uses Tailwind utility classes (same approach as TodoPage in App.tsx).
 */

import { useState } from "react";               // useState = local state for form inputs
import { useNavigate } from "react-router-dom";  // useNavigate = programmatic page navigation
import useAuthStore from "../store/useAuthStore"; // Auth Zustand store (login, loginAsGuest)
import useTodoStore from "../store/useTodoStore"; // Todo store (isDarkMode, toggleTheme)
import AppShell from "../components/layout/AppShell"; // Wrapper that applies "dark" class
import type { AuthStore } from "../types/types";  // Type for auth store selectors

// Import the SAME banner images used by the Todo page
import darkBg from "../assets/dark-bg.png";
import lightBg from "../assets/light-bg.png";

function SignIn() {
  // ── Local State (form inputs — only needed inside this component) ──
  const [name, setName] = useState("");   // What the user typed in the name field
  const [email, setEmail] = useState(""); // What the user typed in the email field

  // ── Global State (from Zustand stores) ──────────────────
  // Auth actions: login saves a RegularUser, loginAsGuest saves a GuestUser
  const login = useAuthStore((s: AuthStore) => s.login);
  const loginAsGuest = useAuthStore((s: AuthStore) => s.loginAsGuest);

  // Theme state + action: isDarkMode tells us which theme is active,
  // toggleTheme switches between light and dark mode
  const isDarkMode = useTodoStore((s) => s.isDarkMode);
  const toggleTheme = useTodoStore((s) => s.toggleTheme);

  // ── Router Hook ─────────────────────────────────────────
  const navigate = useNavigate();

  // ── Form Submit Handler ─────────────────────────────────
  // Runs when user clicks "Sign In" or presses Enter inside the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent browser from reloading (default form behavior)

    // Basic validation: skip if fields are empty or just whitespace
    if (!name.trim() || !email.trim()) return;

    // Save user data to the global auth store → { type: "user", name, email }
    login(name, email);

    // Redirect to home page (Todo app)
    // replace: true so the user can't press "Back" to return here
    navigate("/", { replace: true });
  };

  // ── Guest Login Handler ─────────────────────────────────
  // Runs when user clicks "Continue as Guest"
  const handleGuestLogin = () => {
    // Save guest data to the global auth store → { type: "guest" }
    loginAsGuest();

    // Redirect to home page
    navigate("/", { replace: true });
  };

  // ── Theme-dependent values (same logic as TodoPage in App.tsx) ──
  // These change based on isDarkMode to keep the SignIn page visually consistent
  const bannerImage = isDarkMode ? darkBg : lightBg;
  const gradientColors = isDarkMode
    ? "linear-gradient(#3710BD, #A42395)"  // Purple gradient for dark mode
    : "linear-gradient(#5596FF, #AC2DEB)"; // Blue-purple gradient for light mode
  const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

  return (
    // AppShell wraps the page and applies the "dark" class when isDarkMode is true.
    // This enables all Tailwind `dark:` utilities inside this tree.
    <AppShell>
      {/* ── Main Container ──
          Same structure as TodoPage: full viewport, relative positioning for the banner.
      */}
      <div
        className="app-container min-h-screen w-full relative flex flex-col items-center"
        style={{ backgroundColor }}
      >
        {/* ── Banner Area ──
            Same as TodoPage: two layers stacked with absolute positioning.
            1. Background image layer (scenic photo)
            2. Gradient overlay (semi-transparent purple)
            The banner only covers the top ~300px of the page.
        */}
        <div
          className="banner-area absolute top-0 left-0 right-0 w-full"
          style={{ height: "300px", overflow: "hidden", zIndex: 0 }}
        >
          {/* Layer 1: Background image — positioned to show the scenic part */}
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
          {/* Layer 2: Gradient overlay — gives the purple tint over the image */}
          <div
            className="absolute inset-0"
            style={{ background: gradientColors, opacity: "0.7" }}
          />
        </div>

        {/* ── Content Area ──
            z-10 = floats above the banner (z-0).
            marginTop pushes the content down so the header sits on the banner.
        */}
        <div
          className="relative z-10 flex flex-col items-center w-full"
          style={{ marginTop: "70px" }}
        >
          {/* ── Header Bar ──
              Matches the TodoPage header layout:
              - "SIGN IN" title on the left (same style as "TODO")
              - Theme toggle button on the right
          */}
          <header className="relative w-full max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 mb-8 sm:mb-10 mt-0">
            {/* Page title — same font, size, and letter-spacing as the "TODO" title */}
            <h1
              className="text-4xl sm:text-5xl md:text-5xl font-bold text-white tracking-wider"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "15px",
              }}
            >
              SIGN IN
            </h1>

            {/* Theme toggle button (sun/moon icon) — same as in Header.tsx */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center cursor-pointer transition-all hover:scale-110 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-transparent p-0 shrink-0 border-none outline-none focus:outline-none"
              aria-label="Toggle theme"
            >
              {/* Show sun icon in dark mode, moon icon in light mode */}
              {isDarkMode ? (
                // Sun icon → clicking switches to light mode
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
                // Moon icon → clicking switches to dark mode
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </header>

          {/* ── Sign In Card ──
              Styled like the todo-container card:
              - White background (dark: dark gray)
              - Same border-radius, shadow, and transition
              - Centered with max-width for readability
          */}
          <div
            className="flex flex-col w-full px-4 sm:px-6 items-center max-w-2xl mx-auto"
            style={{ marginTop: "32px" }}
          >
            <div
              className="w-full bg-white dark:bg-[#25273D] shadow-[0px_35px_50px_-15px_rgba(194,195,214,0.5)] dark:shadow-[0px_35px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-200"
              style={{ borderRadius: "5px", overflow: "hidden" }}
            >
              {/* Inner padding for the form content */}
              <div className="py-10 px-8 sm:px-10">
                {/* Card title */}
                <h2
                  className="text-2xl font-bold text-[#494C6B] dark:text-[#e4e5f1] text-center mb-2 tracking-[2px]"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Welcome
                </h2>

                {/* Card subtitle */}
                <p
                  className="text-sm text-[#9495a5] text-center mb-8"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Sign in to access your todos
                </p>

                {/* ── Form ──
                    onSubmit fires handleSubmit when user presses Enter or clicks the button.
                    e.preventDefault() inside handleSubmit stops the page from reloading.
                */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Name input field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-[13px] font-semibold text-[#494C6B] dark:text-[#9495a5] tracking-[1px] uppercase"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Name
                    </label>
                    {/* Controlled input: value is always synced with `name` state.
                        onChange updates state on every keystroke. */}
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="
                        py-3.5 px-4 border border-[#e4e5f1] dark:border-[#393a4b]
                        rounded-[5px] text-base
                        bg-white dark:bg-[#25273D]
                        text-[#494C6B] dark:text-[#e4e5f1]
                        outline-none transition-[border-color] duration-200 ease-in-out
                        focus:border-[#667eea]
                        placeholder:text-[#9495a5]
                      "
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      required
                    />
                  </div>

                  {/* Email input field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-[13px] font-semibold text-[#494C6B] dark:text-[#9495a5] tracking-[1px] uppercase"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        py-3.5 px-4 border border-[#e4e5f1] dark:border-[#393a4b]
                        rounded-[5px] text-base
                        bg-white dark:bg-[#25273D]
                        text-[#494C6B] dark:text-[#e4e5f1]
                        outline-none transition-[border-color] duration-200 ease-in-out
                        focus:border-[#667eea]
                        placeholder:text-[#9495a5]
                      "
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      required
                    />
                  </div>

                  {/* Submit button — gradient matches the banner gradient */}
                  <button
                    type="submit"
                    className="
                      py-3.5 mt-2 border-none rounded-[5px]
                      bg-gradient-to-br from-[#667eea] to-[#764ba2]
                      text-white text-base font-bold
                      tracking-[2px] uppercase cursor-pointer
                      transition-all duration-200
                      hover:opacity-90 hover:-translate-y-px
                      active:translate-y-0
                    "
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Sign In
                  </button>
                </form>

                {/* ── Divider ── separates form login from guest login */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-[#e4e5f1] dark:bg-[#393a4b]" />
                  <span
                    className="text-sm text-[#9495a5]"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    or
                  </span>
                  <div className="flex-1 h-px bg-[#e4e5f1] dark:bg-[#393a4b]" />
                </div>

                {/* Guest login button — outside the <form> so it won't trigger validation */}
                <button
                  className="
                    w-full py-3.5 border rounded-[5px]
                    border-[#e4e5f1] dark:border-[#393a4b]
                    text-[#494C6B] dark:text-[#e4e5f1]
                    bg-transparent text-base font-semibold
                    tracking-[1px] cursor-pointer
                    transition-all duration-200
                    hover:border-[#667eea] hover:opacity-80
                  "
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  onClick={handleGuestLogin}
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default SignIn;
