// src/routes/article.routes.ts
// Article route definitions — handles article CRUD operations.
// Mounted at '/api/articles' in app.ts, so '/' here becomes GET /api/articles.
// GET routes are public; POST/PUT/DELETE routes require authentication (verifyJWT).

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { verifyJWT } from '../middleware/auth.middleware';
import * as articleController from '../controllers/article.controller';

const router = Router();

// ── Zod Schemas ────────────────────────────────────────────────────────────────

// Create: title and content are REQUIRED
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url().optional(),
  published: z.boolean({ required_error: 'Published status is required' }),
});

// Update: title and content are OPTIONAL
const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  published: z.boolean().optional(),
});

// ── Route Definitions ──────────────────────────────────────────────────────────

// GET /api/articles — list all articles with author info (public)
router.get('/', articleController.getAll);

// GET /api/articles/:id — get single article with full details (public)
router.get('/:id', articleController.getById);

// POST /api/articles — create a new article (protected: must be logged in)
router.post('/', verifyJWT, validate(createArticleSchema), articleController.create);

// PUT /api/articles/:id — update an existing article (protected + ownership check in service)
router.put('/:id', verifyJWT, validate(updateArticleSchema), articleController.update);

// DELETE /api/articles/:id — delete an article (protected + ownership check)
router.delete('/:id', verifyJWT, articleController.remove);

export default router;