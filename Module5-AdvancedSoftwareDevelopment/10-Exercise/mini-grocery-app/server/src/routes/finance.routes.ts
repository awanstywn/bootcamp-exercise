/**
 * @fileoverview finance.routes.ts
 * @module routes/finance.routes.ts
 * @description Express router definitions for finance endpoints.
 */
import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/summary', FinanceController.getSummary);
router.get('/transactions', FinanceController.getTransactionHistory);

export default router;
