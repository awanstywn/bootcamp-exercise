// src/app.ts
// Express application setup — registers all global middleware and mounts route handlers.
// Separated from server.ts so the app can be imported into tests without opening a port.
// Think of this file as the "wiring diagram" of the entire API.

import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Self-executing import — loads all .env values into process.env

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────────────
// Middleware executes top-to-bottom. Order matters:
// 1. CORS → 2. Body Parser → 3. Routes → 4. Error Handler

// 1. CORS — must be FIRST so preflight OPTIONS requests are handled before anything else.
//    Without this, browsers block cross-origin requests from the frontend (e.g., localhost:5173).
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Body Parser — converts raw JSON request body into a JavaScript object at req.body.
//    Must run before routes so controllers can access req.body.
app.use(express.json());

// ── Route Mounting ─────────────────────────────────────────────────────────────
// Each router handles a group of related endpoints.
// Prefix determines the base URL: app.use('/api/auth', ...) → POST /api/auth/register
app.use('/api/auth', authRoutes);   // Register, Login
app.use('/api/users', userRoutes);  // User CRUD + user's posts
app.use('/api/posts', postRoutes);  // Post CRUD

// Health check — simple endpoint to verify the server is alive (useful for monitoring/deployment)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
// MUST be registered LAST — catches any error passed via next(error) from routes/middleware.
app.use(errorHandler);

export default app;