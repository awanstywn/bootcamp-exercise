/**
 * @file main.tsx
 * @description Entry point of the React application.
 * This file hooks into the HTML DOM container and boots up the React application.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Select the root DOM node and render the React application inside it.
// The exclamation mark (!) asserts that the 'root' element is not null.
createRoot(document.getElementById('root')!).render(
  // StrictMode highlights potential problems in an application during development.
  <StrictMode>
    <App />
  </StrictMode>,
)

