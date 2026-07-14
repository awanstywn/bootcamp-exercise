/**
 * @fileoverview Vercel Serverless Function Entry Point
 * @objective Wrap the existing Express application as a Vercel Serverless Function.
 * @logic
 * - Imports the fully configured Express `app` from the server source.
 * - Exports it as the default handler for Vercel to invoke on each request.
 * - Vercel automatically maps HTTP requests to this handler.
 */
import app from '../server/src/app.js';

export default app;
