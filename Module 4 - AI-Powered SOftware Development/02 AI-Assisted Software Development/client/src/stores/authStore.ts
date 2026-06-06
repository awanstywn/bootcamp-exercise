/**
 * @fileoverview Zustand state management for Authentication.
 * 
 * Relations:
 * - Consumes: `apiClient` for HTTP requests, `localStorage` for token persistence.
 * - Used by: `useAuth.ts` hook, `App.tsx` (for routing protection), Auth pages.
 * 
 * Logic:
 * - Maintains the global `user` state and an `isLoading` flag.
 * - Handles JWT storage/removal across login, register, and logout actions.
 * - `checkAuth` is called on app initialization to restore the session from the saved token.
 */
import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { LoginInput, RegisterInput, UpdateProfileInput } from 'shared';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await apiClient.get('/auth/me');
        set({ user: response.data.user });
      } catch {
        localStorage.removeItem('token');
        set({ user: null });
      }
    }
    set({ isLoading: false });
  },

  login: async (data: LoginInput) => {
    const response = await apiClient.post('/auth/login', data);
    localStorage.setItem('token', response.data.token);
    set({ user: response.data.user });
  },

  register: async (data: RegisterInput) => {
    await apiClient.post('/auth/register', data);
  },

  updateProfile: async (data: UpdateProfileInput) => {
    const response = await apiClient.put('/auth/profile', data);
    set({ user: response.data.user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
}));
