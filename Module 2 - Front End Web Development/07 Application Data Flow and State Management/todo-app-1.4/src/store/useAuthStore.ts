/**
 * useAuthStore — Global auth state management with Zustand.
 *
 * Stores the signed-in user as a discriminated union (RegularUser | GuestUser).
 * Uses persist middleware to save auth state to localStorage,
 * so the user stays logged in even after refreshing the page.
 *
 * To check if someone is logged in: user !== null
 * To check user type: user.type === "user" or user.type === "guest"
 */

import { create } from "zustand";             // create() builds a Zustand store
import { persist } from "zustand/middleware";   // persist() auto-saves to localStorage
import type { AuthStore } from "../types/types"; // Import our type blueprint

// create<AuthStore>() tells Zustand: "make a store that matches the AuthStore shape"
// persist() wraps it so data survives page refreshes
const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── Initial State ───────────────────────
      // When the app first loads (and nothing is in localStorage), these are the defaults:
      user: null,          // No user is logged in (null = signed out)
      isLoggedIn: false,   // Derived from user !== null (kept in sync by each action)

      // ── Actions ─────────────────────────────

      // login: called when the user submits the Sign In form
      // It receives the name and email they typed, and creates a RegularUser
      login: (name, email) =>
        set({
          // Store user with type: "user" — this is the discriminant tag
          user: { type: "user", name, email },
          isLoggedIn: true,
        }),

      // loginAsGuest: called when the user clicks "Continue as Guest"
      // Creates a GuestUser with no credentials
      loginAsGuest: () =>
        set({
          // Store user with type: "guest" — no name or email needed
          user: { type: "guest" },
          isLoggedIn: true,
        }),

      // logout: called when the user clicks "Sign Out"
      // Clears user back to null (works for both regular and guest users)
      logout: () =>
        set({
          user: null,        // Remove user data — back to signed-out state
          isLoggedIn: false,
        }),
    }),
    {
      name: "auth-storage", // Key name in localStorage (open DevTools → Application → Local Storage to see it)
    }
  )
);

export default useAuthStore;
