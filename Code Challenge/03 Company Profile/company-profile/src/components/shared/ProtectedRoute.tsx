/**
 * @file ProtectedRoute.tsx
 * @description Authentication guard component. Protects secure routes from unauthenticated access,
 * displaying a loading state during session checks or redirecting the browser to `/login`.
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import LoadingSpinner from './LoadingSpinner';

/**
 * Route guard component that wraps child nodes and validates authentication context.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Retrieve authentication checks and checking-state flag from the Zustand store
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Show a centering loading spinner if the user's session is currently being verified.
  if (isLoading) return <LoadingSpinner />;
  
  // If verification finishes and the user is unauthenticated, redirect to Login.
  // 'replace' prevents the login redirection from cluttering browser history.
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Render wrapped route children if the user is logged in.
  return <>{children}</>;
};

export default ProtectedRoute;

