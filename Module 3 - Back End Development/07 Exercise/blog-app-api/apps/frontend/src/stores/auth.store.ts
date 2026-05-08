// src/stores/auth.store.ts
// Zustand store for authentication state — manages user session across the app.
//
// Key concepts:
//   - hydrate(): Called once on app start (in App.tsx useEffect). Restores the session
//     from localStorage so the user stays logged in after page refresh.
//   - login()/register(): Call the auth API, then persist token + user to localStorage
//     and update Zustand state. Toast notifications are fired here (not in components)
//     so every consumer of the store gets consistent feedback.
//   - logout(): Clears both Zustand state and localStorage. The Axios interceptor in
//     client.ts also calls this when a 401 response is received (token expired).
//   - useAuthStore.getState(): Used by Axios interceptors (outside React) to read the
//     current token without needing a hook.

import { create } from 'zustand';
import type { User, LoginInput, RegisterInput } from '@blog-app/shared';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  hydrate: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      toast.success('Successfully logged in!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await authApi.register(data);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      toast.error(msg);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logged out');
  },
}));
