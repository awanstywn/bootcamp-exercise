/**
 * @file useSettings.ts
 * @description Custom React Hook for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for useSettings operations.
 * 
 * @relations
 * Interacts with: react, ../lib/apiClient, ../lib/routes, shared.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import type { SiteSettings } from "shared";

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiClient.get(API_ROUTES.SETTINGS.GET);
        setSettings(res.data.data.settings);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, isLoading };
}
