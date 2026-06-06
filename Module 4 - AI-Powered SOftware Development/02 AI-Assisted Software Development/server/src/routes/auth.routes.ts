/**
 * @fileoverview Express router for Authentication endpoints.
 * 
 * Relations:
 * - Consumes: `AuthController` for logic, `validate`/`auth` middlewares, and Zod schemas from `shared`.
 * - Used by: `app.ts` under the `/api/auth` prefix.
 * 
 * Logic:
 * - Registers routes for user signup (`/register`), login (`/login`), and fetching/updating the profile (`/me`, `/profile`).
 * - Applies Zod schema validation to incoming request bodies before they hit the controller.
 * - Applies JWT authentication to protected routes.
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from 'shared';

const router = Router();

// Route: POST /api/auth/register
// Validates body against RegisterSchema, then calls controller
router.post('/register', validate(RegisterSchema), AuthController.register);

// Route: POST /api/auth/login
// Validates body against LoginSchema, then calls controller
router.post('/login', validate(LoginSchema), AuthController.login);

// Route: GET /api/auth/me
// Protected route using auth middleware
router.get('/me', auth, AuthController.me);

// Route: PUT /api/auth/profile
// Protected route to update user profile
router.put('/profile', auth, validate(UpdateProfileSchema), AuthController.updateProfile);

export default router;
