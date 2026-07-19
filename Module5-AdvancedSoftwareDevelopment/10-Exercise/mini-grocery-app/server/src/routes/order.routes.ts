/**
 * @fileoverview order.routes.ts
 * @module routes/order.routes.ts
 * @description Express router definitions for order endpoints.
 */
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireVisitor } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { createOrderSchema, rejectOrderSchema } from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

// Visitor routes
router.post('/checkout', requireVisitor, validate(createOrderSchema), OrderController.checkout);
router.put('/:id/payment', requireVisitor, upload.single('paymentProof'), OrderController.uploadPaymentProof);
router.put('/:id/cancel', requireVisitor, OrderController.cancelOrder);
router.get('/me', requireVisitor, OrderController.getMyOrders);

// Admin routes
router.get('/all', requireAdmin, OrderController.getAllOrders);
router.put('/:id/status', requireAdmin, OrderController.updateStatus);
router.put('/:id/reject', requireAdmin, validate(rejectOrderSchema), OrderController.rejectOrder);

// Shared route (accessible by both, controller handles authorization based on role)
router.get('/:id', OrderController.getOrderById);

export default router;
