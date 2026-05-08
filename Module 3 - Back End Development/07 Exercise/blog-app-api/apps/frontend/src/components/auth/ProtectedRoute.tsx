// src/components/auth/ProtectedRoute.tsx
// Route guard component — wraps protected pages (e.g., Dashboard).
// Checks the Zustand auth store for authentication status.
// If the user is not authenticated, redirects to the home page.

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
