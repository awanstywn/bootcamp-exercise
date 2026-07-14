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
import { Route, Routes, Navigate } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import CategoriesIndexPage from './pages/CategoriesIndexPage';
import CategoryPage from './pages/CategoryPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import HomePage from './pages/HomePage';
import ManagePostsPage from './pages/ManagePostsPage';
import PopularPostsPage from './pages/PopularPostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PrivacyPage from './pages/PrivacyPage';
import SearchPage from './pages/SearchPage';
import TagPage from './pages/TagPage';
import TagsIndexPage from './pages/TagsIndexPage';
import TermsPage from './pages/TermsPage';
export default function App() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesIndexPage />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/tags" element={<TagsIndexPage />} />
          <Route path="/tags/:tag" element={<TagPage />} />
          <Route path="/popular" element={<PopularPostsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Management Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Navigate to="/dashboard/posts" replace />} />
            <Route path="/dashboard/posts" element={<ManagePostsPage />} />
            <Route path="/dashboard/posts/new" element={<CreatePostPage />} />
            <Route path="/dashboard/posts/edit/:id" element={<EditPostPage />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
