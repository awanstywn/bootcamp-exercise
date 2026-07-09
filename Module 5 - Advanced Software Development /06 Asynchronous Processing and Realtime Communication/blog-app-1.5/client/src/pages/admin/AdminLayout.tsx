/**
 * @fileoverview Admin Layout Component
 * @objective Provide a persistent sidebar navigation wrapper for all Admin-related pages.
 * @risk None inherently, but relies heavily on `ProtectedRoute` wrapping this component in `App.tsx` to prevent unauthorized access.
 * @relations Route: `/admin/*`. Parent to `AdminUsersPage`, `AdminPostsPage`, etc., rendering them via `<Outlet />`.
 * @logic
 * - Defines a list of navigation items.
 * - Highlights the active link based on `useLocation().pathname`.
 * - Renders a sidebar (hidden on mobile) and a main content area.
 */
import { Outlet, NavLink, Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Posts', path: '/admin/posts' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-140px)] bg-slate-50">
      <SEOHead title="Admin Dashboard" />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:block">
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Admin Panel
          </h2>
          <p className="text-xs text-slate-400">Logged in as {user?.name || 'Admin'}</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-12 pt-6 border-t border-slate-200">
          <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
