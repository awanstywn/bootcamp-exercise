/**
 * @fileoverview rbac.middleware.ts
 * @module middleware/rbac.middleware.ts
 * @description Express middleware for rbac.
 */
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';
import { UserRole } from '@prisma/client';

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError('Access denied');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireVisitor = requireRole([UserRole.VISITOR]);
