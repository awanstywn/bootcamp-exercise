/**
 * @file errorHandler.ts
 * @description Express Middleware for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for errorHandler operations.
 * 
 * @relations
 * Interacts with: express.
 * 
 * @howItWorks
 * Intercepts incoming HTTP requests to perform validation, authentication, or error handling before passing control to the next handler. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${err.message}`, err.stack);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
}
