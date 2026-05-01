// src/middleware/auth.middleware.ts
// JWT verification middleware — protects routes that require authentication.
// Flow: Extract token from header → verify signature + expiry → inject decoded user into req.user.
// Applied per-route (not globally), e.g.: router.post('/', verifyJWT, controller.create)
// jsonwebtoken docs: https://www.npmjs.com/package/jsonwebtoken

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

// Shape of the data encoded inside the JWT token (set during token generation in auth.service.ts)
interface JWTPayload {
  userId: string;
  email: string;
}

// Middleware function — runs before the controller on protected routes
export const verifyJWT = (req: Request, _res: Response, next: NextFunction) => {
  // Step 1: Read the Authorization header (format: "Bearer <token>")
  const authHeader = req.headers.authorization;

  // Step 2: Reject if header is missing or doesn't follow "Bearer <token>" convention
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  // Step 3: Extract the token string — "Bearer abc123".split(' ') → ["Bearer", "abc123"]
  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET as string;

    // Step 4: Verify token — checks signature validity AND expiration date.
    //         Throws error if tampered with or expired.
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Step 5: Attach decoded user data to the request object.
    //         Controllers downstream can now access req.user.userId and req.user.email.
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next(); // Token valid — proceed to the next middleware or controller
  } catch (err) {
    // Differentiate between expired and invalid tokens for clearer error messages
    if ((err as Error).name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    return next(new AppError('Invalid token', 401));
  }
};