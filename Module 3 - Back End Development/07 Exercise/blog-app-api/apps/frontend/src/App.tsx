// src/App.tsx
// Main application component that defines the routing structure and global state hydration.
// Logic:
//   - Uses `useAuthStore.hydrate()` on mount to restore user session from localStorage.
//   - Defines all application routes using React Router (v7).
//   - Wraps all pages in a global `Layout` component.
//   - Uses `ProtectedRoute` to guard access to sensitive pages like `/dashboard`.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
