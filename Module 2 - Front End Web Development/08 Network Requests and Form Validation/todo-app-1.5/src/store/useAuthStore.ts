import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import type { AuthStore } from '../types/types';

/**
 * Objective: Global state manager for user authentication.
 * Uses Zustand alongside the `persist` middleware to manage and 
 * automatically save auth state (e.g., tokens) to localStorage.
 */
const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      /** 
       * 1. Initial State: 
       * Represents an unauthenticated user with no active processes or errors.
       */
      user: null,
      userToken: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      // 2. Actions

      /**
       * Authenticates an existing user via `authService`.
       * Upon success, stores the user session and token in the global state.
       */
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login({ email, password });
          set({ 
            user: user, 
            userToken: user['user-token'], 
            isLoggedIn: true, 
            isLoading: false 
          });
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          set({ 
            error: err.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
        }
      },

      /**
       * Registers a new user via `authService`.
       */
      signUp: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register({ name, email, password, confirmPassword: password });
          set({ isLoading: false });
          return true;
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          set({ 
            error: err.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          return false;
        }
      },

      /**
       * Logs out the current user by clearing the server session 
       * and resetting the local authentication state.
       */
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.logout();
          set({ 
            user: null, 
            userToken: null, 
            isLoggedIn: false, 
            isLoading: false 
          });
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } };
          set({ 
            error: err.response?.data?.message || 'Logout failed', 
            isLoading: false 
          });
        }
      },

      /**
       * Attempts to re-validate the persisted user session.
       * (Currently acts as a placeholder; actual validation would hit an API endpoint).
       */
      restoreSession: async () => {
        // Since we persist 'userToken', Axios interceptors will use it automatically.
        // A complete implementation here would call a validate-token endpoint.
      },

      /**
       * Clears any active authentication errors from the state.
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    
    /** 
     * 3. Persist Configuration: 
     * Defines exactly what properties get saved in localStorage 
     * when the page reloads or is closed.
     */
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        userToken: state.userToken,
        isLoggedIn: state.isLoggedIn 
      }),
    }
  )
);

export default useAuthStore;
