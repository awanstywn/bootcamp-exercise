/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/authService.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Frontend service layer for Authentication.
 *   Provides methods for register, login, and logout.
 *   REPLACES the Backendless version that called Backendless API endpoints.
 *
 * RELATIONS:
 *   - lib/axios.ts           → HTTP client that automatically injects JWT token
 *   - store/useAuthStore.ts  → Calls login/register methods from here
 *   - Backend:
 *     POST /api/auth/register → authService.register()
 *     POST /api/auth/login    → authService.login()
 *     POST /api/auth/logout   → authService.logout()
 *
 * HOW IT WORKS:
 *   Each method sends a POST request to the Express backend.
 *   - register: sends { name, email, password } → gets { message, user }
 *   - login: sends { email, password } → gets { user, token }
 *   - logout: sends empty request → server clears session (stateless)
 *
 * CHANGES from v1.5:
 *   - URL: Backendless /users/login → Express /api/auth/login
 *   - Response: BackendlessUser → { user: AppUser, token: string }
 *   - Auth Header: 'user-token' → 'Authorization: Bearer <token>'
 * ═══════════════════════════════════════════════════════════════════════════
 */

import apiClient from '../lib/axios';

// ── Backend Response Types ──

/** Response from POST /api/auth/login */
interface LoginResponse {
  user: { id: string; name: string; email: string };
  token: string;  // JWT token valid for 7 days
}

/** Response from POST /api/auth/register */
interface RegisterResponse {
  message: string;
  user: { id: string; name: string; email: string };
}

const authService = {
  /**
   * Register — Sign up for a new account on the Express backend.
   * After success, the user still needs to login separately (no auto-login).
   */
  register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await apiClient.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Login — Authenticate user and receive a JWT token.
   * This token is stored in the Zustand store and used by the axios interceptor.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
    // response.data = { user: { id, name, email }, token: "eyJ..." }
  },

  /**
   * Logout — Notify the server to clear the session.
   * Since JWT is stateless, the server doesn't actually store sessions.
   * Crucially, the frontend removes the token from the Zustand store after this.
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};

export default authService;
