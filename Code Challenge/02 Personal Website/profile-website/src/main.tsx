/**
 * main.tsx - Application Entry Point
 *
 * Renders the App component wrapped in StrictMode for development checks.
 * State management is now handled globally via Zustand.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
