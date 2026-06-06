/**
 * @fileoverview Custom hook for consuming Authentication state.
 * 
 * Relations:
 * - Consumes: `authStore.ts`.
 * - Used by: Components that need quick access to user data or logout functionality without importing Zustand directly.
 * 
 * Logic:
 * - Acts as a simple alias wrapper over `useAuthStore()`.
 */
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  return useAuthStore();
};
