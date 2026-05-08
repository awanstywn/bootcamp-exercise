// src/main.tsx
// Application entry point.
// Logic:
//   - Renders the React root component.
//   - Wraps the app in `StrictMode` for development-time checks.
//   - Initializes the global `Toaster` for app-wide notifications, 
//     styled to match the dark theme.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#141419',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
  </StrictMode>,
);
