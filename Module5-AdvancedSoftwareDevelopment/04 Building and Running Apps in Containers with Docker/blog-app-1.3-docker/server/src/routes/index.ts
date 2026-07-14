/**
 * @fileoverview Master Route Configuration
 * @objective Aggregate all feature-specific routers into a single master router to be mounted by the Express app.
 * @risk None structurally, but ensures clear prefixing for all API endpoints.
 * @relations Imported by `app.ts`. Imports all other routers (`auth.routes.ts`, `content.routes.ts`, etc.).
 * @logic
 * - Mounts feature routers under specific paths (`/auth`, `/content`, `/upload`, `/admin`).
 * - Exposes a simple `/health` endpoint for uptime monitoring and load balancer health checks.
 */
import { Router } from 'express';
import prisma from '../db/prisma.js';
import authRoutes from './auth.routes.js';
import contentRoutes from './content.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';
import settingRoutes from './setting.routes.js';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingRoutes);

router.get('/health', async (req, res) => {
  try {
    // Lightweight database connectivity check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

export default router;
