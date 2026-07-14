/**
 * @fileoverview PostCSS Configuration
 * @objective Integrate Tailwind CSS into the Vite build pipeline.
 * @risk Removing this file will break all Tailwind utility classes in the application.
 * @relations Read by Vite during CSS compilation.
 * @logic
 * - Injects `@tailwindcss/postcss` for processing Tailwind directives (`@import 'tailwindcss'`, etc.).
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
