/**
 * @file authStore.ts
 * @description State Management Store for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for authStore operations.
 * 
 * @relations
 * Interacts with: zustand, zustand/middleware, ./cartStore.
 * 
 * @howItWorks
 * Uses Zustand to manage global client-side state, providing actions to mutate state across components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cartStore";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  login: (user: User, token: string) => void;
  register: (user: User, token: string) => void;
  logout: () => void;
  setGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isGuest: false,
      login: (user, token) => set({ user, token, isGuest: false }),
      register: (user, token) => set({ user, token, isGuest: false }),
      logout: () => {
        useCartStore.getState().clearCart();
        set({ user: null, token: null, isGuest: false });
      },
      setGuest: () => set({ user: null, token: null, isGuest: true }),
    }),
    { name: "auth-storage" }
  )
);
