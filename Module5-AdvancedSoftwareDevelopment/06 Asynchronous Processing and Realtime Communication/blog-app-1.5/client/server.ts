/**
 * @fileoverview SSR Entry Point (Express Wrapper)
 * @objective Provide an Express server that handles Server-Side Rendering (SSR) for the React application in both Development and Production.
 * @risk Poor error handling or memory leaks here can crash the entire frontend SSR process.
 * @relations This is executed when running `tsx server.ts`. It loads `entry-server.tsx` to render the React tree to an HTML string.
 * @logic
 * - **Development**: Attaches Vite's dev middleware to intercept requests, hot-reload, and dynamically compile the SSR entry point.
 * - **Production**: Uses `sirv` to serve static assets and directly requires the pre-built `entry-server.js` file.
 * - Injects the rendered HTML (`<!--app-html-->`) and SEO meta tags (`<!--app-head-->`) into `index.html`.
 */
/* eslint-disable no-console */
import express from 'express';
import fs from 'node:fs/promises';

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// Cached production assets
const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

import helmet from 'helmet';

// Create http server
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));

// Proxy API requests to backend in production (Vite dev server handles this in development)
let apiProxy: any;
if (isProduction) {
  const { createProxyMiddleware } = await import('http-proxy-middleware');
  apiProxy = createProxyMiddleware({ 
    pathFilter: ['/api', '/socket.io'], 
    target: 'http://localhost:3000', 
    changeOrigin: true,
    ws: true
  });
  app.use(apiProxy);
}

// Add Vite or respective production middlewares
let vite: import('vite').ViteDevServer | undefined;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression() as express.RequestHandler);
  app.use(base, sirv('./dist/client', { extensions: [] }) as express.RequestHandler);
}

// Serve HTML
app.use(async (req, res, _next) => {
  try {
    // Ensure the url always starts with a '/' after removing the base
    let url = req.originalUrl.replace(base, '');
    if (!url.startsWith('/')) url = '/' + url;

    // Skip SSR for static assets to prevent React Router "No routes matched" warnings
    if (url.match(/\.(ico|png|jpg|jpeg|svg|css|js|map)$/)) {
      res.status(404).end();
      return;
    }

    let template: string;
    let render: typeof import('./src/entry-server').render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite!.transformIndexHtml(url, template);
      render = (await vite!.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      // The production bundle might not exist before the build step
      render = (await import('./dist/server/entry-server.js')).render;
    }

    const rendered = await render(url);

    const headTags = rendered.helmet
      ? `
        ${rendered.helmet.title.toString()}
        ${rendered.helmet.meta.toString()}
        ${rendered.helmet.link.toString()}
        ${rendered.helmet.script.toString()}
      `
      : '';

    const html = template
      .replace(`<!--app-head-->`, headTags)
      .replace(`<!--app-html-->`, rendered.html ?? '');

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    const error = e as Error;
    vite?.ssrFixStacktrace(error);
    console.error(error);
    res.status(500).end(error.stack);
  }
});

// Start http server
const server = app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

if (isProduction && apiProxy) {
  server.on('upgrade', apiProxy.upgrade);
}
