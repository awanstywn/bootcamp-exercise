/**
 * @file adminGuard.ts
 * @description Express Middleware for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for adminGuard operations.
 * 
 * @relations
 * Interacts with: express.
 * 
 * @howItWorks
 * Intercepts incoming HTTP requests to perform validation, authentication, or error handling before passing control to the next handler. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Forbidden — admin access required",
    });
  }

  next();
}
