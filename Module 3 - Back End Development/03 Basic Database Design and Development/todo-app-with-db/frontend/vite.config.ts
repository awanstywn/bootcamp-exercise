import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/bootcamp-exercise/demos/todo-app-1.5/',
  plugins: [react(), tailwindcss()],
})
