/**
 * @fileoverview Express router for Category endpoints.
 * 
 * Relations:
 * - Consumes: `CategoryController`, `auth` middleware, and Zod schemas.
 * - Used by: `app.ts` under the `/api/categories` prefix.
 * 
 * Logic:
 * - Secures all endpoints with the `auth` middleware (applied globally to the router instance).
 * - Maps standard RESTful paths (`/`, `/:id`) to their respective controller methods.
 * - Validates POST/PUT request bodies against `CreateCategorySchema` and `UpdateCategorySchema`.
 */
import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { CreateCategorySchema, UpdateCategorySchema } from 'shared';

const router = Router();

// All category routes require authentication
router.use(auth);

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', validate(CreateCategorySchema), CategoryController.create);
router.put('/:id', validate(UpdateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
