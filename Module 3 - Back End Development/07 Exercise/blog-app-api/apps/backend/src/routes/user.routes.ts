// src/routes/user.routes.ts
// User route definitions — handles user profile CRUD and fetching a user's articles.
// Mounted at '/api/users' in app.ts, so '/:id' here becomes GET /api/users/:id.
// Mix of public and protected routes — only profile updates require authentication.
// Express Router docs: https://expressjs.com/en/guide/routing.html

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { verifyJWT } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

// ── Zod Schema ─────────────────────────────────────────────────────────────────
// All fields optional — user can update any combination of fields

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),        // If provided, must be non-empty
  bio: z.string().optional(),                // Free-form text, no min length
  avatar: z.string().url().optional(),       // If provided, must be a valid URL
});

// ── Route Definitions ──────────────────────────────────────────────────────────

// GET /api/users — list all users (public, no auth required)
router.get('/', userController.getAll);

// GET /api/users/:id — get single user profile (public)
router.get('/:id', userController.getById);

// PUT /api/users/:id — update user profile (protected + ownership check in service)
// Chain: verifyJWT → validate → controller. Service layer checks req.user.userId === :id
router.put('/:id', verifyJWT, validate(updateUserSchema), userController.update);

// GET /api/users/:id/articles — get all articles by a specific user (public)
router.get('/:id/articles', userController.getArticlesByUser);

export default router;