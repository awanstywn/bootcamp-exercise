/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: middleware/authenticate.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   JWT (JSON Web Token) Authentication Middleware.
 *   Verifies that protected requests include a valid JWT token in the 
 *   "Authorization" header.
 *
 * RELATIONS:
 *   - routes/*.routes.ts   → Used as middleware for routes requiring auth
 *   - config/env.ts        → Retrieves JWT_SECRET for token verification
 *   - utils/AppError.ts    → Throws error if token is missing, invalid, or expired
 *   - services/auth.service.ts → Generates the token during login
 *
 * HOW IT WORKS:
 *   1. Reads the "Authorization" header from the request.
 *   2. Ensures the format is "Bearer <token>" (industry standard).
 *   3. Extracts the token string.
 *   4. Verifies the token signature using the secret key (jwt.verify).
 *   5. If valid: Decodes payload → attaches userId to req.userId → calls next().
 *   6. If invalid: Throws AppError 401 (Unauthorized).
 *
 * ANALOGY:
 *   Like a security guard checking ID cards at a building entrance.
 *   Valid card → Allowed entry. Expired → Request renewal. Fake → Rejected.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

/**
 * Extend Express Request Interface
 * Informs TypeScript that req.userId exists after authentication middleware.
 */
declare global {
  namespace Express {
    interface Request {
      userId: string;  // User UUID from the JWT payload
    }
  }
}

/**
 * Middleware: Verify JWT from Authorization header.
 * If valid, attaches req.userId and proceeds to the next handler.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Step 1: Get Authorization header
  const authHeader = req.headers.authorization;
  
  // Step 2: Validate "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication token missing');
  }
  
  // Step 3: Extract token string
  const token = authHeader.split(' ')[1];
  
  try {
    // Step 4: Verify signature and expiry using secret key
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
    
    // Step 5: Attach userId to the request object
    req.userId = decoded.userId;
    
    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    // Specific error for expired tokens (useful for frontend auto-logout)
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Session expired, please login again');
    }
    
    // Generic invalid token error (signature mismatch, malformed, etc.)
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token');
  }
};
