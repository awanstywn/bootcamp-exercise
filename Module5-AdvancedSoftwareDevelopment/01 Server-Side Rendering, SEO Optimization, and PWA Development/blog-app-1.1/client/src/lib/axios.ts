/**
 * @fileoverview Axios HTTP Client Configuration
 * @objective Configure the base Axios instance with default settings (baseURL, credentials) and response interceptors.
 * @risk Infinite loops can occur if the interceptor constantly retries a failed refresh token request.
 * @relations Used globally across the frontend to communicate with the Express backend.
 * @logic
 * - Sets `withCredentials: true` to ensure cookies (Access/Refresh tokens) are sent with every cross-origin request.
 * - Intercepts `401 Unauthorized` responses.
 * - If a 401 occurs, it attempts to call `/auth/refresh` once (`_retry` flag).
 * - If refresh succeeds, it replays the original failed request.
 * - If refresh fails, it dispatches a global `auth-unauthorized` event to forcefully log the user out.
 */
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Important for cookies
});
