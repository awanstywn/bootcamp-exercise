/**
 * @fileoverview Authentication Global State (Zustand)
 * @objective Manage the current user's session state and provide methods for logging in, logging out, and verifying sessions.
 * @risk XSS vulnerabilities if sensitive data (like tokens) were stored here. However, this app stores tokens in HTTP-only cookies, so the store only holds safe UI data.
 * @relations Used globally (App.tsx, ProtectedRoute.tsx, Navbar). Interacts with `axios.ts`.
 * @logic
 * - `checkAuth`: Hits `/auth/me` to verify if the server considers the session valid based on current cookies.
 * - `logout`: Hits `/auth/logout` to clear server cookies, then nullifies the local user state.
 * - Listens to the `auth-unauthorized` event emitted by the Axios interceptor to log out immediately if the refresh token expires.
 */
import { create } from 'zustand';
import { api } from '../lib/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (_error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed', error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
}));

// Listen for global unauthorized events from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth-unauthorized', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
}
