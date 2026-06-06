/**
 * @fileoverview Axios HTTP client configuration.
 * 
 * Relations:
 * - Consumes: `axios`.
 * - Used by: All Zustand stores (`authStore`, `productStore`, `categoryStore`, `dashboardStore`) to communicate with the backend API.
 * 
 * Logic:
 * - Creates a global Axios instance with a pre-configured `baseURL`.
 * - Attaches a request interceptor to automatically inject the JWT token (if present) into the `Authorization` header.
 * - Attaches a response interceptor to globally handle 401 Unauthorized errors by clearing the token from local storage.
 */
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // We will handle redirect in the auth context or routing layer
    }
    return Promise.reject(error);
  }
);
