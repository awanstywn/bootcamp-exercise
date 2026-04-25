/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: lib/axios.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Pre-configured Axios HTTP client for communicating with the Express backend.
 *   Provides automatic JWT injection and global session expiration handling.
 *
 * RELATIONS:
 *   - config/api.ts           → Provides the API_BASE_URL.
 *   - store/useAuthStore.ts   → Reads the userToken for Authorization headers.
 *   - services/*              → All service layers use this client for API calls.
 *
 * HOW IT WORKS:
 *   1. Request Interceptor: Before any request leaves the browser, it retrieves
 *       the JWT token from the Zustand store and attaches it to the
 *       'Authorization: Bearer <token>' header.
 *   2. Response Interceptor: If the backend returns a 401 (Unauthorized) or 403 (Forbidden)
 *       status (outside of login/register pages), the app automatically wipes
 *       the local session and redirects the user to the Sign In page.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import useAuthStore from '../store/useAuthStore';

// --- Create Axios Instance ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,          // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════
//  REQUEST INTERCEPTOR
// ═══════════════════════════════════════════════════
apiClient.interceptors.request.use((config) => {
  // Get token from Zustand store directly (using getState for non-hook access)
  const token = useAuthStore.getState().userToken;

  if (token) {
    // Attach standard JWT Bearer token header
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// ═══════════════════════════════════════════════════
//  RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════════════
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Exclude auth endpoints from auto-logout (those return 401 for wrong passwords)
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    // Handle session expiration
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      // Wipe local auth state
      useAuthStore.getState().clearError();
      useAuthStore.setState({ user: null, userToken: null, isLoggedIn: false });

      // Force redirect to sign-in page
      window.location.href = '/signin';
    }

    return Promise.reject(error);
  }
);

export default apiClient;