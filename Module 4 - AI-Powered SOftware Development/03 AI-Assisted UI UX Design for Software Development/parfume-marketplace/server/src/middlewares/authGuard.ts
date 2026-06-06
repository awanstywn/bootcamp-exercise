/**
 * @file authGuard.ts
 * @description Express Middleware for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for authGuard operations.
 * 
 * @relations
 * Interacts with: express, jsonwebtoken.
 * 
 * @howItWorks
 * Intercepts incoming HTTP requests to perform validation, authentication, or error handling before passing control to the next handler. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized — no token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized — invalid or expired token",
    });
  }
}

/**
 * Optional auth — sets req.user if token is present, but doesn't block if absent.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (req as any).user = decoded;
    } catch {
      // Token invalid — proceed without user
    }
  }

  next();
}
