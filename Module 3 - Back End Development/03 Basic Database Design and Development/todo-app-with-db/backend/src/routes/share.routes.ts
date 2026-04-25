/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: routes/share.routes.ts (Merged Route + Handler)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Handles both the API for creating share links and the public redirection logic.
 *   This file exports TWO routers:
 *   1. shareApiRouter: Protected endpoint for creating short codes.
 *   2. shareRedirectRouter: Public endpoint for resolving codes to frontend URLs.
 *
 * RELATIONS:
 *   - server.ts            → Mounts shareApiRouter at /api/share
 *   - server.ts            → Mounts shareRedirectRouter at /s
 *   - services/share.service.ts → Logic for code generation and resolution
 *   - config/env.ts       → BASE_URL and FRONTEND_URL for redirection
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response, NextFunction } from 'express';
import { shareService } from '../services/share.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validateBody.js';
import { env } from '../config/env.js';

// --- Handlers ---

/** 
 * POST /api/share - Create a short code for a specific todo 
 */
const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { todo_id } = req.body;
    const result = await shareService.createShortCode(todo_id, req.userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/** 
 * GET /s/:code - Resolve code and redirect to the frontend shared page 
 */
const redirect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.params.code as string;
    const result = await shareService.resolveCode(code);

    if (!result) {
      return res.redirect(302, `${env.FRONTEND_URL}/not-found`);
    }

    return res.redirect(302, `${env.FRONTEND_URL}/shared/${result.todo_id}`);
  } catch (error) {
    next(error);
  }
};

// --- Route Definitions ---

// API Router (Protected)
export const shareApiRouter = Router();
shareApiRouter.post('/', authenticate, validateBody(['todo_id']), create);

// Redirect Router (Public)
export const shareRedirectRouter = Router();
shareRedirectRouter.get('/:code', redirect);
