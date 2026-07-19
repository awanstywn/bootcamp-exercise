/**
 * @fileoverview product.routes.ts
 * @module routes/product.routes.ts
 * @description Express router definitions for product endpoints.
 */
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/rbac.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();

// Public routes
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Admin routes
router.use(authenticate, requireAdmin);

router.post(
  '/',
  upload.single('image'),
  validate(createProductSchema),
  ProductController.create
);

router.put(
  '/:id',
  upload.single('image'),
  validate(updateProductSchema),
  ProductController.update
);

router.delete('/:id', ProductController.delete);

export default router;
