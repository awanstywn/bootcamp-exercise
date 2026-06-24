/**
 * @file useAuthStore.ts
 * @description Global authentication store powered by Zustand.
 * Manages user session state, handles login/register/logout actions,
 * and synchronizes user info with browser localStorage for persistency.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';
import { loginUser, logoutUser, getCurrentUser, registerUser } from '@/lib/backendless';

/**
 * Custom Zustand React hook for auth state management.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Defaults
      user: null,
      isLoading: true,
      isAuthenticated: false,

      /**
       * Action to restore user session when the application initializes.
       * Leverages Backendless SDK internal cookies/tokens, verifies the session,
       * and updates local store.
       */
      restoreSession: async () => {
        try {
          // Query Backendless to check if the session token in the environment/cookies is still valid.
          const currentUser = (await getCurrentUser()) as User | null;
          if (currentUser) {
            set({ user: currentUser, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Logs a user in with their credentials and updates the Zustand store.
       */
      login: async (email: string, password: string) => {
        const loggedInUser = (await loginUser(email, password)) as User;
        set({ user: loggedInUser, isAuthenticated: true });
      },

      /**
       * Registers a new user account, immediately logs them in,
       * and updates the global store.
       */
      register: async (email: string, password: string, name: string) => {
        // Create database entry on Backendless
        await registerUser(email, password, name);
        // Execute login operation immediately to acquire the user-token
        const loggedInUser = (await loginUser(email, password)) as User;
        set({ user: loggedInUser, isAuthenticated: true });
      },

      /**
       * Invalidates the active Backendless user token and resets Zustand state.
       */
      logout: async () => {
        await logoutUser();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth_user', // unique name
      partialize: (state) => ({ 
        user: state.user ? { objectId: state.user.objectId, email: state.user.email, name: state.user.name, role: state.user.role } : null,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

