/**
 * @fileoverview Zustand state management for Dashboard statistics.
 * 
 * Relations:
 * - Consumes: `apiClient`.
 * - Used by: `DashboardPage.tsx`.
 * 
 * Logic:
 * - Fetches aggregated statistics (total products, low stock, etc.) from the `/products/stats` endpoint.
 * - Keeps track of loading and error states for the dashboard view.
 */
import { create } from "zustand";
import { apiClient } from "../api/client";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStock: number;
  activeProducts: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: true,
  error: "",

  fetchStats: async () => {
    set({ isLoading: true, error: "" });
    try {
      const response = await apiClient.get("/products/stats");
      set({ stats: response.data, isLoading: false });
    } catch {
      set({ error: "Failed to load dashboard statistics.", isLoading: false });
    }
  },
}));
