/**
 * @fileoverview Role-Based Access Control (RBAC) Middleware
 * @objective Ensure that only authenticated users with specific roles can access a route.
 * @risk Security bypass if roles are not correctly assigned or checked. Ensure `req.user` is properly hydrated by `auth.middleware.ts` beforehand.
 * @relations Used in Express routes (e.g., `admin.routes.ts`) alongside the `authenticate` middleware.
 * @logic
 * - Higher-order function that takes a list of `allowedRoles`.
 * - Returns an Express middleware.
 * - Checks if `req.user` exists (401 if missing).
 * - Checks if `req.user.role` is included in the `allowedRoles` (403 if missing).
 * - Calls `next()` if authorized.
 */
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthorized. Please log in.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Forbidden. You do not have permission to perform this action.'));
    }

    next();
  };
};
