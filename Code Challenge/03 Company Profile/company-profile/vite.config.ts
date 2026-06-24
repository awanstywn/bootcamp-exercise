import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/company-profile/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/node_modules/backendless/')) return 'vendor-backendless';
            if (id.includes('/node_modules/framer-motion/')) return 'vendor-motion';
            if (id.includes('/node_modules/react-router-dom/') || id.includes('/node_modules/react-router/')) return 'vendor-router';
            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'vendor-react';
          }
        }
      }
    }
  }
})
