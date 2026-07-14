/**
 * @fileoverview Server-Side Rendering Entry Point
 * @objective Export a render function that converts the React tree into an HTML string for Express to serve.
 * @risk Memory leaks can occur if context objects (like HelmetContext) are not properly garbage collected per request.
 * @relations Required by `client/server.ts` during SSR. Uses `StaticRouter` instead of `BrowserRouter`.
 * @logic
 * - Takes the incoming request `url` and passes it to `<StaticRouter>`.
 * - Uses `ReactDOMServer.renderToString()` to render `<App />`.
 * - Extracts SEO metadata from `react-helmet-async` context.
 * - Returns both the HTML string and the Helmet tags to be injected into `index.html`.
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';

interface HelmetContext {
  helmet?: HelmetServerState;
}

export function render(url: string) {
  const helmetContext: HelmetContext = {};
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>,
  );

  const { helmet } = helmetContext;

  return { html, helmet };
}
