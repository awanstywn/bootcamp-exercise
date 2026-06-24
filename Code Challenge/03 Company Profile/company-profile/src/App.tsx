/**
 * @file App.tsx
 * @description Main application component that coordinates global state, page routing,
 * code splitting (dynamic imports), and SEO head tag providers.
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import Layout from '@/components/shared/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Dynamic lazy-loading imports for every page view.
// This splits the code into smaller chunks that are loaded on-demand,
// dramatically improving the initial page-load performance (Lighthouse Performance score).
const Home           = lazy(() => import('@/pages/Home'));
const AboutUs        = lazy(() => import('@/pages/AboutUs'));
const Services       = lazy(() => import('@/pages/Services'));
const Teams          = lazy(() => import('@/pages/Teams'));
const BlogList       = lazy(() => import('@/pages/BlogList'));
const BlogDetail     = lazy(() => import('@/pages/BlogDetail'));
const CreateBlog     = lazy(() => import('@/pages/CreateBlog'));
const EditBlog       = lazy(() => import('@/pages/EditBlog'));
const Login          = lazy(() => import('@/pages/Login'));
const Docs           = lazy(() => import('@/pages/Docs'));
const Register       = lazy(() => import('@/pages/Register'));
const ContactUs      = lazy(() => import('@/pages/ContactUs'));
const PrivacyPolicy  = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const Security       = lazy(() => import('@/pages/Security'));
const FAQ            = lazy(() => import('@/pages/FAQ'));
const NotFound       = lazy(() => import('@/pages/NotFound'));

/**
 * App component that defines the primary application shell,
 * routing paths, and authentication initialization.
 */
export default function App() {
  // Extract session recovery utility from our Zustand authentication store.
  const restoreSession = useAuthStore((state) => state.restoreSession);

  // Restore existing user session from local storage immediately when the app mounts.
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    // HelmetProvider permits dynamic metadata (document title, meta descriptions) injection on each page for SEO.
    <HelmetProvider>
      {/* HashRouter prevents 404 errors on server reloads for static builds by using hashes (#) in the URL. */}
      <Router>
        {/* Suspense delays rendering children until lazy-loaded page modules are completely downloaded. */}
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Layout serves as the global layout shell, holding the Header/Navbar and Footer elements. */}
            <Route element={<Layout />}>
              {/* Public routes visible to everyone */}
              <Route path="/"            element={<Home />} />
              <Route path="/about"       element={<AboutUs />} />
              <Route path="/services"    element={<Services />} />
              <Route path="/teams"       element={<Teams />} />
              <Route path="/blog"        element={<BlogList />} />
              <Route path="/blog/:id"    element={<BlogDetail />} />
              
              {/* Protected route that redirects users to login if they aren't authenticated.
                  Matches '/blog/create' specifically, placed before general '/blog/:id' parameter router. */}
              <Route path="/blog/create" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
              <Route path="/blog/edit/:id" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
              
              {/* Additional functional utilities and information pages */}
              <Route path="/docs"        element={<Docs />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/register"    element={<Register />} />
              <Route path="/contact"     element={<ContactUs />} />
              <Route path="/privacy"     element={<PrivacyPolicy />} />
              <Route path="/terms"       element={<TermsOfService />} />
              <Route path="/security"    element={<Security />} />
              <Route path="/faq"         element={<FAQ />} />

              {/* Fallback Catch-all Route for handling unknown endpoints (404 Page) */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

