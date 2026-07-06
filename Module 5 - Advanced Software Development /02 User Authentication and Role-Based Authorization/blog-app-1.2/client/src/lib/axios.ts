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
import axios, { InternalAxiosRequestConfig } from 'axios';

// Extend the internal config type to include our custom property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Important for cookies
});

// Variables to handle multiple requests failing at the same time
let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Interceptor to handle automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue the request
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        // Refresh token is invalid/expired
        if (typeof window !== 'undefined') {
          // Trigger logout or redirect in client
          window.dispatchEvent(new Event('auth-unauthorized'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
