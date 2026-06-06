/**
 * @file ProtectedRoute.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ProtectedRoute operations.
 * 
 * @relations
 * Interacts with: react-router-dom, ../../stores/authStore.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function ProtectedRoute() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    // Redirect to auth page, save the attempted url so we can optionally return them
    return <Navigate to="/auth?view=register" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
