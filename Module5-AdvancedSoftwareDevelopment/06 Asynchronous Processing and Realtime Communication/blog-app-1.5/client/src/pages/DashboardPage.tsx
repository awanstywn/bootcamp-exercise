/**
 * @fileoverview Dashboard Page Component
 * @objective Serve as the central hub for authenticated users to manage their profile, posts, and settings.
 * @risk Exposing admin links to non-admins. Mitigated by conditional rendering based on `user.role`.
 * @relations Route: `/dashboard`. Protected by `<ProtectedRoute>`.
 * @logic
 * - Reads `user` object from `authStore`.
 * - Displays personalized welcome message.
 * - Conditionally renders the "Admin Settings" card only if `user.role === 'ADMIN'`.
 */
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SEOHead from '../components/SEOHead';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead title="Dashboard" />
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Welcome back, {user?.name || 'User'}!</h2>
        <p className="text-slate-600 mb-6">Manage your posts, profile, and settings from here.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
            <h3 className="font-bold text-lg mb-2">My Posts</h3>
            <p className="text-slate-500 mb-4 flex-1">
              View, edit, and manage your published articles and drafts.
            </p>
            <div className="mt-auto flex gap-4">
              <Link to="/dashboard/posts" className="text-primary-600 font-medium hover:underline inline-block w-fit">
                Manage Posts →
              </Link>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
            <h3 className="font-bold text-lg mb-2">Profile Settings</h3>
            <p className="text-slate-500 mb-4 flex-1">Update your personal information and password.</p>
            <Link to="/profile" className="text-primary-600 font-medium hover:underline mt-auto inline-block w-fit">
              Edit Profile →
            </Link>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
              <h3 className="font-bold text-lg mb-2">Admin Settings</h3>
              <p className="text-slate-500 mb-4 flex-1">Manage users, roles, categories, and tags.</p>
              <Link to="/admin" className="text-primary-600 font-medium hover:underline mt-auto inline-block w-fit">
                Go to Admin →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
