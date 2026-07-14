/**
 * @fileoverview Authentication Middleware
 * @objective Identify and attach the currently authenticated user to the Express Request object.
 * @risk If the JWT secret is compromised, attackers can forge tokens. It gracefully handles missing tokens (acting as guest), relying on RBAC for enforcement.
 * @relations Used in Express routes. Reads `access_token` from cookies. Requires `env.JWT_ACCESS_SECRET`.
 * @logic
 * - Reads `access_token` from `req.cookies`.
 * - If no token is found, it calls `next()` (user stays undefined/anonymous).
 * - If found, it attempts to verify the token using `jsonwebtoken`.
 * - On success, attaches `{ id, role }` to `req.user`.
 * - On failure (expired/invalid token), clears the cookie and proceeds as anonymous.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.access_token;

  // Fallback to Bearer token if cookie is missing
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); // Proceed as anonymous, RBAC will catch if required
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (_error) {
    res.clearCookie('access_token');
    req.user = undefined;
    next();
  }
};
