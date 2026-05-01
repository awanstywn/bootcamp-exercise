// src/routes/auth.routes.ts
// Authentication route definitions — maps URL paths to middleware chains and controller handlers.
// Mounted at '/api/auth' in app.ts, so '/register' here becomes POST /api/auth/register.
// Express Router docs: https://expressjs.com/en/guide/routing.html

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

// ── Zod Schemas ────────────────────────────────────────────────────────────────
// Define the expected shape of req.body for each route.
// If validation fails, the validate() middleware returns 400 before reaching the controller.

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),              // Must be non-empty string
  email: z.string().email('Invalid email format'),           // Must be valid email format
  password: z.string().min(8, 'Password must be at least 8 characters'), // Minimum 8 chars for security
});

const loginSchema = z.object({
  email: z.string().email(),                                 // Must be valid email
  password: z.string().min(1, 'Password is required'),       // Must not be empty
});

// ── Route Definitions ──────────────────────────────────────────────────────────
// Middleware chain: request → validate(schema) → controller handler
// No verifyJWT here — auth routes are public (user isn't logged in yet)

// POST /api/auth/register — create new user account
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login — authenticate user, return JWT token
router.post('/login', validate(loginSchema), authController.login);

export default router;