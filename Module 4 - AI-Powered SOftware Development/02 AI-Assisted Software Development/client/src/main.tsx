/**
 * @fileoverview Main entry point for the React application.
 * 
 * Relations:
 * - Consumes: `App.tsx` and global styles (`index.css`).
 * - Used by: `index.html` as the root script.
 * 
 * Logic:
 * - Mounts the React component tree into the DOM's `#root` element.
 * - Wraps the application in `StrictMode` to highlight potential issues in an application.
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
