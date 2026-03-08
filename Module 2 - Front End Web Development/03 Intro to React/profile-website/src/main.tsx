/**
 * main.tsx - Application Entry Point
 *
 * This is the main entry point for the React application.
 * It handles:
 * - Importing necessary React dependencies
 * - Importing global CSS styles
 * - Importing the root App component
 * - Rendering the App component into the DOM
 *
 * Rendering Process:
 * 1. Import StrictMode wrapper from React
 * 2. Import createRoot for React 18+ rendering
 * 3. Import global styles (Tailwind CSS)
 * 4. Import the main App component
 * 5. Find the #root element in the HTML
 * 6. Create a React root and render the App component wrapped in StrictMode
 *
 * StrictMode:
 * - Activates additional development mode checks
 * - Helps identify potential problems early
 * - Intentionally renders components twice in development to detect side effects
 * - Does not affect production build
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Create a React root and render the App component
 *
 * document.getElementById('root') - Finds the div with id="root" in index.html
 * <StrictMode> - Wraps App for additional development checks
 * <App /> - The root component containing all sections
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
