/**
 * @fileoverview Engagement Routes
 * @objective Define API endpoints for interactions such as comments and likes on posts.
 * @risk Endpoints that modify state (POST, DELETE) must correctly implement `authenticate` to ensure non-anonymous actions.
 * @relations Mounted under `/api/posts/:postId` via `content.routes.ts` or directly in `index.ts`.
 * @logic
 * - Mounts `GET /comments` for public viewing.
 * - Mounts `POST /comments` and `DELETE /comments/:id` requiring `authenticate` and Zod validation.
 * - Mounts `GET /likes/status` and `POST /likes` requiring authentication.
 */
import { Router } from 'express';
import { EngagementController } from '../controllers/engagement.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCommentSchema } from '../validators/content.validator.js';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true }); // Important for getting :postId from parent router

// Comments
router.get('/comments', EngagementController.getComments);
router.post(
  '/comments',
  authenticate,
  authorize(Role.ADMIN, Role.AUTHOR, Role.SUBSCRIBER),
  validate(createCommentSchema),
  EngagementController.addComment,
);
router.delete('/comments/:id', authenticate, authorize(Role.ADMIN, Role.AUTHOR, Role.SUBSCRIBER), EngagementController.deleteComment);

// Likes
router.get('/likes/status', authenticate, authorize(Role.ADMIN, Role.AUTHOR, Role.SUBSCRIBER), EngagementController.checkLikeStatus);
router.post('/likes', authenticate, authorize(Role.ADMIN, Role.AUTHOR, Role.SUBSCRIBER), EngagementController.toggleLike);

export default router;
