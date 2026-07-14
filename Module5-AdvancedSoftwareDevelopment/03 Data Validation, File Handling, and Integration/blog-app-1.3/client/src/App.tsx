/**
 * @fileoverview Main Application Component
 * @objective Serve as the root React component, defining global layout (Header/Footer) and all application routing.
 * @risk Improperly configured ProtectedRoutes can accidentally expose admin pages or user dashboards to unauthenticated users.
 * @relations Rendered by `entry-client.tsx` and `entry-server.tsx`. Depends on `react-router-dom` and `authStore`.
 * @logic
 * - Initializes authentication state on mount via `checkAuth()`.
 * - Renders the global navigation header (conditionally showing Login/Logout based on `isAuthenticated`).
 * - Defines `Routes`, mapping URL paths to specific Page components.
 * - Wraps sensitive pages with `<ProtectedRoute>`, passing role requirements for Admin areas.
 */
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AboutPage from './pages/AboutPage';
import AuthorProfilePage from './pages/AuthorProfilePage';
import AuthorsIndexPage from './pages/AuthorsIndexPage';
import CategoriesIndexPage from './pages/CategoriesIndexPage';
import CategoryPage from './pages/CategoryPage';
import CreatePostPage from './pages/CreatePostPage';
import DashboardPage from './pages/DashboardPage';
import EditPostPage from './pages/EditPostPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ManagePostsPage from './pages/ManagePostsPage';
import PopularPostsPage from './pages/PopularPostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PrivacyPage from './pages/PrivacyPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SearchPage from './pages/SearchPage';
import TagPage from './pages/TagPage';
import TagsIndexPage from './pages/TagsIndexPage';
import TermsPage from './pages/TermsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { useAuthStore } from './store/authStore';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/authors/:authorName" element={<AuthorProfilePage />} />
          <Route path="/categories" element={<CategoriesIndexPage />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/tags" element={<TagsIndexPage />} />
          <Route path="/tags/:tag" element={<TagPage />} />
          <Route path="/authors" element={<AuthorsIndexPage />} />
          <Route path="/popular" element={<PopularPostsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/posts"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'AUTHOR']}>
                <ManagePostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/posts/new"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'AUTHOR']}>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/posts/edit/:id"
            element={
              <ProtectedRoute requireRole={['ADMIN', 'AUTHOR']}>
                <EditPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
