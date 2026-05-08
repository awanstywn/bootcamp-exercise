/**
 * @fileoverview Authentication middleware.
 * @objective To protect secure routes by verifying JSON Web Tokens (JWT) provided by the client.
 * @logic
 * 1. `extractToken`: Helper function that extracts the token from the `Authorization` header (Bearer token) or from cookies.
 * 2. `authMiddleware`: Intercepts requests to protected routes. It retrieves the token, verifies it using `verifyToken`, and attaches the decoded `userId` and `email` to the Express `Request` object for downstream use.
 * 3. If the token is missing, invalid, or expired, it immediately responds with a 401 Unauthorized status.
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      sendError(res, 'Missing authorization token', 401);
      return;
    }

    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return req.cookies?.token || null;
};
