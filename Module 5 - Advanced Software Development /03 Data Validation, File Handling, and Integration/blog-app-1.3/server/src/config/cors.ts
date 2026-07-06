/**
 * @fileoverview CORS Configuration
 * @objective Define the Cross-Origin Resource Sharing policy for the Express server.
 * @risk Misconfiguring CORS (e.g., wildcard origin in production) can lead to Cross-Site Request Forgery (CSRF) or unauthorized API access.
 * @relations Used in `app.ts` as an argument to the `cors()` middleware. Relies on `env.CLIENT_URL`.
 * @logic
 * - Allows requests specifically from the frontend `CLIENT_URL`.
 * - Allows credentials (cookies) to be sent cross-origin.
 * - Restricts methods to standard REST verbs.
 */
import { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
