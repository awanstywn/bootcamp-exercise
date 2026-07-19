/**
 * @fileoverview auth.middleware.ts
 * @module middleware/auth.middleware.ts
 * @description Express middleware for auth.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import { UserRole } from '@prisma/client';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };
    
    req.user = decoded;
    next();
  } catch (_error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};
