/**
 * @fileoverview cart.routes.ts
 * @module routes/cart.routes.ts
 * @description Express router definitions for cart endpoints.
 */
import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireVisitor } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { cartItemSchema, updateCartItemSchema } from '../validators/cart.validator.js';

const router = Router();

router.use(authenticate, requireVisitor);

router.get('/', CartController.getCart);
router.post('/items', validate(cartItemSchema), CartController.addItem);
router.put('/items/:productId', validate(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:productId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
