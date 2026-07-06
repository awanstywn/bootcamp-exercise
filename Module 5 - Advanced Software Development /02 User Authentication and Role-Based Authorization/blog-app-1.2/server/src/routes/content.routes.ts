/**
 * @fileoverview Content Routes
 * @objective Define the API surface for fetching and manipulating core blog content (categories, tags, posts).
 * @risk Failure to properly apply `authorize()` middleware could allow Authors to create Categories/Tags which should be restricted to ADMIN/EDITOR.
 * @relations Mounted under `/api/content`. Also mounts nested `engagementRoutes` under `/posts/:postId`.
 * @logic
 * - Sets up GET routes (public) for categories, tags, and posts.
 * - Sets up POST/PUT/DELETE routes requiring `authenticate`, strict role authorization (`authorize`), and payload validation (`validate`).
 * - Delegates actual processing to `ContentController`.
 */
import { Router } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import engagementRoutes from './engagement.routes.js';
import { Role } from '@prisma/client';

const router = Router();

// Categories
router.get('/categories', ContentController.getCategories);
router.post(
  '/categories',
  authenticate,
  authorize(Role.ADMIN),
  ContentController.createCategory,
);

// Tags
router.get('/tags', ContentController.getTags);
router.post(
  '/tags',
  authenticate,
  authorize(Role.ADMIN),
  ContentController.createTag,
);

// Authors
router.get('/authors', ContentController.getAuthors);

// Posts
router.get('/posts', authenticate, ContentController.getPosts);
router.get('/posts/:slug', authenticate, ContentController.getPostBySlug);
router.post(
  '/posts',
  authenticate,
  authorize(Role.ADMIN, Role.AUTHOR),
  ContentController.createPost,
);
router.put(
  '/posts/:id',
  authenticate,
  authorize(Role.ADMIN, Role.AUTHOR),
  ContentController.updatePost,
);
router.delete(
  '/posts/:id',
  authenticate,
  authorize(Role.ADMIN, Role.AUTHOR),
  ContentController.deletePost,
);

// Nested engagement routes (posts/:postId/comments and posts/:postId/likes)
router.use('/posts/:postId', engagementRoutes);

export default router;
