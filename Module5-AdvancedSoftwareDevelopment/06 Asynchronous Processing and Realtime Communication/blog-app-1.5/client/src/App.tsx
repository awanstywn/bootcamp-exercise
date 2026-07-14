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
import { useEffect, Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import { Toaster } from 'react-hot-toast';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const AuthorProfilePage = lazy(() => import('./pages/AuthorProfilePage'));
const AuthorsIndexPage = lazy(() => import('./pages/AuthorsIndexPage'));
const CategoriesIndexPage = lazy(() => import('./pages/CategoriesIndexPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EditPostPage = lazy(() => import('./pages/EditPostPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ManagePostsPage = lazy(() => import('./pages/ManagePostsPage'));
const PopularPostsPage = lazy(() => import('./pages/PopularPostsPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TagPage = lazy(() => import('./pages/TagPage'));
const TagsIndexPage = lazy(() => import('./pages/TagsIndexPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminPostsPage = lazy(() => import('./pages/admin/AdminPostsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));

export default function App() {
  const { checkAuth } = useAuthStore();
  useSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Toaster position="top-right" />
      <Header />

      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>}>
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
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
