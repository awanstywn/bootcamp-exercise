/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: server.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Main entry point for the Todo App Backend.
 *   This file initializes the Express application, attaches middlewares,
 *   registers routes, and starts the HTTP server.
 *
 * FLOW:
 *   1. Initialize Express instance.
 *   2. Attach Global Middlewares (CORS, JSON Parser, Logger).
 *   3. Register API Routes with appropriate prefixes.
 *   4. Handle 404 (Route Not Found) and Global Errors.
 *   5. Listen on the configured PORT from .env.
 *
 * RELATIONS:
 *   - config/env.ts       → Provides environment variables (PORT, CORS URL).
 *   - routes/*.ts         → All API route groups.
 *   - middleware/*.ts      → Error handling and request validation.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// --- Configuration ---
import { env } from './config/env.js';

// --- Routes ---
import authRoutes from './routes/auth.routes.js';
import todoRoutes from './routes/todo.routes.js';
import { shareApiRouter, shareRedirectRouter } from './routes/share.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// --- Error Handler ---
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ═══════════════════════════════════════════════════
//  GLOBAL MIDDLEWARE
// ═══════════════════════════════════════════════════

// 1. CORS — Allows communication with the Frontend
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. JSON Parser — Parse incoming JSON request bodies
app.use(express.json());

// 3. Morgan Logger — Log HTTP requests to the console
app.use(morgan('dev'));

// ═══════════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════════

// Auth: Register, Login, Logout
app.use('/api/auth', authRoutes);

// Todos: CRUD + search + filter + reorder
app.use('/api/todos', todoRoutes);

// Share Links: API to create links
app.use('/api/share', shareApiRouter);

// Analytics: User statistics
app.use('/api/analytics', analyticsRoutes);

// ═══════════════════════════════════════════════════
//  PUBLIC REDIRECTS
// ═══════════════════════════════════════════════════

// Shared Link Resolver: /s/:code -> 302 Redirect
app.use('/s', shareRedirectRouter);

// ═══════════════════════════════════════════════════
//  ERROR HANDLING
// ═══════════════════════════════════════════════════

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'NOT_FOUND', 
    message: `The route ${req.method} ${req.url} was not found on this server.` 
  });
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

// ═══════════════════════════════════════════════════
//  SERVER START
// ═══════════════════════════════════════════════════

app.listen(env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${env.PORT}`);
  console.log(`📦 Mode: ${env.NODE_ENV}`);
});
