/**
 * @fileoverview Configuration for the Vite bundler.
 * 
 * Relations:
 * - Consumes: `@vitejs/plugin-react`, `@tailwindcss/vite`.
 * - Used by: Vite CLI (`npm run dev`, `npm run build`).
 * 
 * Logic:
 * - Sets up React and TailwindCSS plugins.
 * - Configures path aliases (`@/` maps to `./src`).
 * - Configures the dev server to proxy `/api` requests to the backend on port 3000 to avoid CORS issues locally.
 */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },  
});
