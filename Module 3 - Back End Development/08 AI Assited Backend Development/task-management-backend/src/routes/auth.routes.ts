/**
 * @fileoverview Authentication routing configuration.
 * @objective To define and map authentication-related HTTP endpoints to their respective service handlers.
 * @logic
 * 1. Initializes an Express Router instance.
 * 2. `/register` (POST): Validates input, passes data to `authService.register`, and returns the newly created user and token.
 * 3. `/login` (POST): Validates credentials, authenticates via `authService.login`, and returns the session token.
 * 4. `/profile` (GET): Protected route (using `authMiddleware`) that retrieves the authenticated user's profile details.
 * 5. Utilizes `asyncHandler` to manage asynchronous route execution safely.
 */
import { Router, Response } from 'express';
import { authService } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { validateRequest, authValidation } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.post(
  '/register',
  validateRequest(authValidation),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  }),
);

router.post(
  '/login',
  validateRequest(authValidation.slice(0, 2)),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }),
);

router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const profile = await authService.getProfile(req.userId);
    sendSuccess(res, profile);
  }),
);

export default router;
