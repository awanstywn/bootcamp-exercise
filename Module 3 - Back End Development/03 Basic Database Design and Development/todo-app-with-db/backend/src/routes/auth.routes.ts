/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: routes/auth.routes.ts (Merged Route + Handler)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Handles all authentication-related requests (Register, Login, Logout).
 *   This file combines both Route definitions and Handler logic to 
 *   reduce boilerplate and keep code concise.
 *
 * RELATIONS:
 *   - server.ts            → Mounts this router at /api/auth
 *   - services/auth.service.ts → Executes business logic (hash, verify, JWT)
 *   - middleware/validateBody.ts → Validates request body fields
 *   - middleware/authenticate.ts → Verifies JWT for logout
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { validateBody } from '../middleware/validateBody.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// --- Auth Handlers ---

/**
 * POST /api/auth/register
 * Request body: { name, email, password }
 */
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json({ message: 'Registration successful', user: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Request body: { email, password }
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Security: Requires a valid JWT
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

// --- Route Definitions ---

router.post('/register', validateBody(['name', 'email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.post('/logout', authenticate, logout);

export default router;
