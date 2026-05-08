// src/api/client.ts
// Shared Axios instance — every API call in the app goes through this client.
// Two interceptors handle cross-cutting concerns:
//   1. Request interceptor: automatically attaches the JWT token from Zustand store to every request.
//   2. Response interceptor: catches 401 (Unauthorized) responses and triggers a global logout,
//      so expired/invalid tokens are handled consistently without duplicating logic in every component.
// The baseURL is set to '/api' which is proxied to the backend by Vite's dev server (see vite.config.ts).

import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
