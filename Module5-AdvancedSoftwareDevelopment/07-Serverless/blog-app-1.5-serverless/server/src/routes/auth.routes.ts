/**
 * @fileoverview Authentication Routes
 * @objective Expose endpoints for user identity management.
 * @risk Brute force attacks on `/login`. Rate limiting (not implemented here) is typically recommended for these routes.
 * @relations Mounted under `/api/auth`. Relies on `AuthController` and validation middlewares.
 * @logic
 * - Mounts `POST /register` and `/login` with Zod validation.
 * - Mounts `POST /logout` and `/refresh` for session lifecycle management.
 * - Mounts `GET /me` (requires authentication) to retrieve the active session profile.
 * - Mounts `POST /google` for processing OAuth callbacks from the frontend.
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/verify-email', authLimiter, AuthController.verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticate, AuthController.getMe);
router.post('/google', authLimiter, AuthController.googleCallback);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

export default router;
