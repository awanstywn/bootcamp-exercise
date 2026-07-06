/**
 * @fileoverview Authentication Routes
 * @objective Expose endpoints for user identity management.
 * @risk Brute force attacks on `/login`. Rate limiting is implemented for these routes.
 * @relations Mounted under `/api/auth`. Relies on `AuthController`.
 * @logic
 * - Mounts `POST /register` and `/login` without Zod validation.
 * - Mounts `POST /logout` and `/refresh` for session lifecycle management.
 * - Mounts `GET /me` (requires authentication) to retrieve the active session profile.
 * - Mounts `POST /google` for processing OAuth callbacks from the frontend.
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { error: 'Too many attempts from this IP, please try again after 15 minutes' },
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticate, AuthController.getMe);
router.post('/google', authLimiter, AuthController.googleCallback);

export default router;
