/**
 * @fileoverview app.ts
 * @module app.ts
 * @description Handles logic for app.ts
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { corsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { NotFoundError } from './utils/errors.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { performanceMiddleware } from './middleware/performance.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Trust reverse proxy (e.g., if deploying behind Nginx/ALB/Cloudflare)
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(requestIdMiddleware);
app.use(performanceMiddleware);

// Serve uploaded files statically with basic security hardening
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  dotfiles: 'deny',
  immutable: true,
  maxAge: '1d', // Cache images for 1 day
}));

app.use('/api', globalLimiter, routes);

// Catch-all for undefined routes (404 handler)
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server.`));
});

app.use(errorMiddleware);

export default app;
