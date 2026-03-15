/**
 * main.tsx — Vite entry point.
 * Mounts the React app into the #root element with StrictMode enabled.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // Global styles + Tailwind CSS setup
import App from './App.tsx'

// Find the <div id="root"> in index.html and mount the React app into it.
// The "!" tells TypeScript: "I'm sure this element exists, trust me."
createRoot(document.getElementById('root')!).render(
  // StrictMode runs components twice in development to catch bugs early.
  // It has no effect in production builds.
  <StrictMode>
    <App />
  </StrictMode>,
)
