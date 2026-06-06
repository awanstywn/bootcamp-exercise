/**
 * @file useAuth.ts
 * @description Custom React Hook for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for useAuth operations.
 * 
 * @relations
 * Interacts with: react, ../lib/apiClient, ../lib/routes, ../stores/authStore.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const { user, token, isGuest, login: storeLogin, logout: storeLogout, setGuest } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(API_ROUTES.AUTH.LOGIN, { email, password });
      storeLogin(res.data.data.user, res.data.data.token);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(API_ROUTES.AUTH.REGISTER, { name, email, password, confirmPassword });
      storeLogin(res.data.data.user, res.data.data.token);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
  };

  const continueAsGuest = () => {
    setGuest();
  };

  return {
    user,
    token,
    isGuest,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    continueAsGuest,
    isLoading,
    error,
    setError,
  };
}
