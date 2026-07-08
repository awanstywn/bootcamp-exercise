/**
 * @fileoverview Admin Routes
 * @objective Provide endpoints exclusively for administrative actions (e.g., viewing analytics, modifying user roles).
 * @risk High risk. If `authorize('ADMIN')` is omitted, regular users could escalate privileges or view sensitive analytics.
 * @relations Mounted under `/api/admin`. Interacts directly with Prisma for simple administrative queries.
 * @logic
 * - `GET /analytics`: Runs parallel count queries across Users, Posts, and Comments.
 * - `PATCH /users/:id/role`: Updates a user's role in the database.
 * - Both endpoints enforce `authenticate` AND `authorize('ADMIN')`.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { AdminController } from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateRoleSchema, updateRoleRequestSchema } from '../validators/admin.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// Get total users, posts, comments, likes (Admin only)
router.get('/analytics', authenticate, authorize(Role.ADMIN), AdminController.getAnalytics);

// Get all users
router.get('/users', authenticate, authorize(Role.ADMIN), AdminController.getUsers);

// Update user role
router.patch('/users/:id/role', authenticate, authorize(Role.ADMIN), validate(updateRoleSchema), AdminController.updateUserRole);

// Role Requests
router.get('/role-requests', authenticate, authorize(Role.ADMIN), AdminController.getRoleRequests);
router.patch('/role-requests/:id', authenticate, authorize(Role.ADMIN), validate(updateRoleRequestSchema), AdminController.updateRoleRequestStatus);

export default router;
