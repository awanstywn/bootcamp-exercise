// src/routes/post.routes.ts
// Post route definitions — handles post CRUD operations.
// Mounted at '/api/posts' in app.ts, so '/' here becomes GET /api/posts.
// GET routes are public; POST/PUT routes require authentication (verifyJWT).
// Express Router docs: https://expressjs.com/en/guide/routing.html

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { verifyJWT } from '../middleware/auth.middleware';
import * as postController from '../controllers/post.controller';

const router = Router();

// ── Zod Schemas ────────────────────────────────────────────────────────────────

// Create: content is REQUIRED (you can't create an empty post)
const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required'),   // Post body text — mandatory
  imageUrl: z.string().url().optional(),                // Optional image attachment — must be valid URL
});

// Update: content is OPTIONAL (user might only want to change the image)
const updatePostSchema = z.object({
  content: z.string().min(1).optional(),                // If provided, must be non-empty
  imageUrl: z.string().url().optional(),                // If provided, must be valid URL
});

// ── Route Definitions ──────────────────────────────────────────────────────────

// GET /api/posts — list all posts with author info and like/comment counts (public)
router.get('/', postController.getAll);

// GET /api/posts/:id — get single post with full details: comments + likes (public)
router.get('/:id', postController.getById);

// POST /api/posts — create a new post (protected: must be logged in)
// Chain: verifyJWT → validate → controller. authorId is taken from req.user.userId
router.post('/', verifyJWT, validate(createPostSchema), postController.create);

// PUT /api/posts/:id — update an existing post (protected + ownership check in service)
// Chain: verifyJWT → validate → controller. Service verifies post.authorId === req.user.userId
router.put('/:id', verifyJWT, validate(updatePostSchema), postController.update);

export default router;