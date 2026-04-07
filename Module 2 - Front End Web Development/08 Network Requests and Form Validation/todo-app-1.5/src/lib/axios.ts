import axios from 'axios';
import { BASE_URL } from '../config/backendless';
import useAuthStore from '../store/useAuthStore';

/**
 * Objective: Pre-configured Axios HTTP client for the Backendless API.
 * 
 * Centralizes API configuration (Base URL, headers, timeouts) to prevent repetition.
 * Includes request and response interceptors to automatically secure requests with 
 * auth tokens and globally handle unauthorized or expired sessions.
 */
const backendlessAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the user token to every outgoing request if available
backendlessAPI.interceptors.request.use((config) => {
  const token = useAuthStore.getState().userToken;
  if (token) {
    config.headers['user-token'] = token;
  }
  return config;
});

// Automatically handle unauthorized (401/403) responses by clearing state and redirecting
backendlessAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // Avoid triggering full-page reload when a user simply enters wrong credentials during login/register
    const isAuthEndpoint = error.config?.url?.includes('/users/login') || error.config?.url?.includes('/users/register');
    
    if (!isAuthEndpoint && (error.response?.status === 401 || error.response?.status === 403)) {
      useAuthStore.getState().clearError();
      useAuthStore.setState({ user: null, userToken: null, isLoggedIn: false });
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default backendlessAPI;