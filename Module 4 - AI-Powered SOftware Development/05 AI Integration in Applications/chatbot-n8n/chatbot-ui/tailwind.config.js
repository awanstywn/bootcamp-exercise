/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1a2e',
        primary: '#3b82f6',
        secondary: '#e5e7eb'
      }
    }
  },
  plugins: [],
}
