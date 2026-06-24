/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stripe-inspired purple palette
        primary: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a4a4ff',
          500: '#635bff',  // Stripe purple
          600: '#5249e5',
          700: '#4238cc',
          900: '#1a1557',
        },
        dark: {
          100: '#f6f9fc',
          200: '#e3e8ee',
          700: '#2d3748',
          800: '#1a202c',
          900: '#0a2540',  // Stripe dark navy
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
