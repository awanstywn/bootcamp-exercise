/**
 * @fileoverview Client-Side Entry Point
 * @objective Hydrate the server-rendered HTML with React's event listeners and state management in the browser.
 * @risk Mismatches between the SSR HTML and this hydration pass will cause React hydration errors and UI flickering.
 * @relations Bundled by Vite and injected into `index.html` via a `<script>` tag. Renders `<App />`.
 * @logic
 * - Uses `ReactDOM.hydrateRoot()` instead of `createRoot()` because the HTML is already rendered by the SSR server.
 * - Wraps the app in `<BrowserRouter basename={import.meta.env.BASE_URL}>` for client-side routing.
 * - Wraps the app in `<HelmetProvider>` to manage dynamic `<head>` tags (SEO).
 */
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
