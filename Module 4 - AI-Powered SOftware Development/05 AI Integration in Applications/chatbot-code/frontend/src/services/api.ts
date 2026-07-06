/**
 * @file api.ts
 * @description Centralized Axios instance for communicating with the backend API. Implements global response interceptors for standardized error handling.
 * @module Frontend/Services/API
 */

import axios from "axios";

// One Axios instance with shared base URL and config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000, // 30 seconds timeout
  headers: { "Content-Type": "application/json" },
});

// Response interceptor: handle errors centrally
api.interceptors.response.use(
  (response) => response, // If successful, just continue
  (error) => {
    // Extract error message from backend response
    const message =
      error.response?.data?.error || error.message || "An error occurred. Please try again.";
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  }
);

export default api;
