/**
 * @fileoverview index.ts
 * @module routes/index.ts
 * @description Express router definitions for index endpoints.
 */
import { Router } from 'express';

const router = Router();

// ==========================================
// Health Check Endpoint
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==========================================
// Mount your route modules below
// ==========================================
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import financeRoutes from './finance.routes.js';

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/finance', financeRoutes);

export default router;
