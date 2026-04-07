import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// ── SPA Routing Workaround for GitHub Pages ──
// If the page was redirected from 404.html, the path is in the 'p' query parameter.
// We restore it to the browser's history before React Router takes over.
(function(l) {
  if (l.search[1] === 'p') {
    const queryParams = new URLSearchParams(l.search);
    const path = queryParams.get('p')?.replace(/~and~/g, '&');
    const query = queryParams.get('q')?.replace(/~and~/g, '&');
    
    if (path) {
      const base = l.pathname.endsWith('/') ? l.pathname.slice(0, -1) : l.pathname;
      window.history.replaceState(null, '',
        base + path + (query ? '?' + query : '') + l.hash
      );
    }
  }
}(window.location));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
