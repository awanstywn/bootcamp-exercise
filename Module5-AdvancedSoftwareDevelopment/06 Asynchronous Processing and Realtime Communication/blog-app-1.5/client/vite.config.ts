/**
 * @fileoverview Vite Configuration
 * @objective Configure the frontend build tool, including React support and Progressive Web App (PWA) generation.
 * @risk Misconfiguring caching strategies in `workbox` can result in users seeing stale content or breaking offline mode.
 * @relations Used by `npm run dev:client` and `npm run build:client`. Generates the `dist/` output.
 * @logic
 * - `react()`: Enables JSX transformation and Fast Refresh.
 * - `VitePWA()`: Generates the `manifest.json` and configures Workbox service workers.
 * - Sets a `NetworkFirst` strategy for HTML documents to ensure fresh SSR content, and `StaleWhileRevalidate` for assets.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Execora Blog Platform',
        short_name: 'Execora',
        description: 'A modern full-stack blog platform.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Use network first caching strategy suitable for dynamic SSR sites
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image' ||
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  ssr: {
    noExternal: ['react-helmet-async', '@react-oauth/google'],
  },
});
