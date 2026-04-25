/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: routes/analytics.routes.ts (Merged Route + Handler)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Handles request for the Analytics dashboard.
 *   Provides statistical data about user's todos.
 *
 * RELATIONS:
 *   - server.ts            → Mounts this router at /api/analytics
 *   - services/analytics.service.ts → Executes complex SQL for stats
 *   - middleware/authenticate.ts → Verifies JWT and provides req.userId
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// --- Handlers ---

/**
 * GET /api/analytics - Fetch summary of todo analytics
 */
const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await analyticsService.getSummary(req.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// --- Route Definitions ---

router.get('/', authenticate, getSummary);

export default router;
