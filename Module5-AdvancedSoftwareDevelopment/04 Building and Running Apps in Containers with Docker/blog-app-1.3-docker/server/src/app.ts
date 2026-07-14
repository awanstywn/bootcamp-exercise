/**
 * @fileoverview Express Application Setup
 * @objective Configure the Express application instance, attach global middlewares (CORS, Helmet, parsing), and mount API routes.
 * @risk Misconfiguring global middlewares (like CORS or parsing limits) can open up security vulnerabilities (e.g., DDOS via large payloads).
 * @relations Imported by `server.ts`. Mounts the aggregated `routes/index.ts` and the global `errorMiddleware`.
 * @logic
 * - Adds `helmet` for basic HTTP header security.
 * - Configures CORS with custom options (to allow credentials and specific origins).
 * - Parses incoming JSON and URL-encoded payloads with size limits.
 * - Parses cookies using `cookie-parser`.
 * - Mounts all routes under `/api`.
 * - Catches all unhandled errors with `errorMiddleware` as the final handler.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// Trust reverse proxy (e.g., if deploying behind Nginx/ALB/Cloudflare)
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' })); // Lowered from 10mb for better DoS protection
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', routes);

// Catch-all for undefined routes (404 handler)
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server.`));
});

app.use(errorMiddleware);

export default app;
