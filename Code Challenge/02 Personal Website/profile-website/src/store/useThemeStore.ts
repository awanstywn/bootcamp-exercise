import { create } from "zustand";
import { persist } from "zustand/middleware";

// State structure for global styling, navigation, and menu configuration
interface ThemeState {
  activeSection: string;                         // Current visible section in the viewport (Intersection Observer)
  mobileMenuOpen: boolean;                       // Flag checking if the hamburger menu is expanded
  theme: "light" | "dark";                       // Theme type indicator
  setActiveSection: (section: string) => void;   // Sets active tab menu link
  toggleMobileMenu: () => void;                  // Inverts hamburger visibility
  closeMobileMenu: () => void;                   // Forces mobile menu closure
  setTheme: (theme: "light" | "dark") => void;   // Sets global app theme
}

// Global store utilizing Zustand with persistence middleware
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      activeSection: "home",
      mobileMenuOpen: false,
      theme: "light",
      setActiveSection: (section) => set({ activeSection: section }),
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }), // Only persist theme preference in localStorage
    }
  )
);
