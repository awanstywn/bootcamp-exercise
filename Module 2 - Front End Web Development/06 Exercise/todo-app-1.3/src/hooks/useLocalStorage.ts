import { useState, useEffect } from "react";

/**
 * Generic localStorage sync hook.
 * Note: For this app, Zustand's persist middleware handles localStorage automatically.
 * This hook is provided as a utility for any one-off component-level persistence needs
 * (e.g., collapsing panels, UI state not in the store).
 *
 * @param key    - localStorage key string
 * @param initial - initial/fallback value if key doesn't exist in storage
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage not available (e.g., private browsing quota exceeded)
      console.warn(`useLocalStorage: failed to write key "${key}"`);
    }
  }, [key, value]);

  return [value, setValue];
}