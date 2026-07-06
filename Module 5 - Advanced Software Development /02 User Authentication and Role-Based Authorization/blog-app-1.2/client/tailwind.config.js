/**
 * @fileoverview Tailwind CSS Configuration
 * @objective Define the design token system (colors, fonts) and configure the paths where Tailwind should look for utility classes.
 * @risk Missing paths in the `content` array will cause Tailwind to purge styles, breaking the UI in production.
 * @relations Read by Vite and PostCSS during the build process. Affects all `.tsx` files in `client/src`.
 * @logic
 * - Injects custom colors (`primary`, `surface`) to match the "Execora" branding.
 * - Adds `Inter` as the default sans-serif font and `Merriweather` for serif headings.
 */
/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#1e293b', // Switch primary to dark slate/black for stark branding
          600: '#0f172a',
          700: '#020617',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    typography,
    forms,
  ],
};
