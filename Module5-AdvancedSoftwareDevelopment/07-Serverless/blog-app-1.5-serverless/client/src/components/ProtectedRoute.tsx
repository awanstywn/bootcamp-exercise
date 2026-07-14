/**
 * @fileoverview Protected Route Wrapper
 * @objective Restrict access to specific routes based on authentication status and user roles.
 * @risk Flaws in logic here could expose administrative interfaces (e.g. `AdminLayout.tsx`) to unauthorized users.
 * @relations Used extensively in `App.tsx` to guard dashboard and admin routes. Reads state from `authStore.ts`.
 * @logic
 * - Shows a loading state while `authStore` is verifying the initial session.
 * - Redirects to `/login` (saving the intended destination in `state`) if the user is not authenticated.
 * - Shows an "Access Denied" view if a specific `requireRole` array is provided and the user's role isn't in it.
 * - Renders the child components if all checks pass.
 */
import { type ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: string[];
}) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user && !requireRole.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 glass-panel rounded-xl text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-slate-600 mb-4">You do not have permission to view this page.</p>
        <Link to="/" className="btn-secondary inline-block">
          Return Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
