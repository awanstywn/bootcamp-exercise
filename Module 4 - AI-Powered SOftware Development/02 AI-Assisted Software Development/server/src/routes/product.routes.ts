/**
 * @fileoverview Express router for Product endpoints.
 * 
 * Relations:
 * - Consumes: `ProductController`, `auth` middleware, and Zod schemas.
 * - Used by: `app.ts` under the `/api/products` prefix.
 * 
 * Logic:
 * - Protects all routes by applying the `auth` middleware at the router level.
 * - Mounts CRUD routes and a specific `/stats` endpoint for dashboard aggregations.
 * - Enforces data integrity on product creation and updates using Zod validation middlewares.
 */
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { CreateProductSchema, UpdateProductSchema } from 'shared';

const router = Router();

// All product routes require authentication
router.use(auth);

router.get('/', ProductController.getAll);
router.get('/stats', ProductController.getStats);
router.get('/:id', ProductController.getById);
router.post('/', validate(CreateProductSchema), ProductController.create);
router.put('/:id', validate(UpdateProductSchema), ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
