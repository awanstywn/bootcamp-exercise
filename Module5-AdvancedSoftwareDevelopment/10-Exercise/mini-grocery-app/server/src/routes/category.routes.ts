/**
 * @fileoverview category.routes.ts
 * @module routes/category.routes.ts
 * @description Express router definitions for category endpoints.
 */
import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Admin routes
router.use(authenticate, requireAdmin);
router.post('/', validate(createCategorySchema), CategoryController.create);
router.put('/:id', validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
