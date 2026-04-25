/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: middleware/errorHandler.ts (Merged Class + Middleware)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Contains the AppError custom class and the global error handler middleware.
 *   Consolidating these reduces project complexity and keeps error logic together.
 *
 * HOW IT WORKS:
 *   1. Throw 'new AppError(status, code, msg)' in services or routes.
 *   2. The 'errorHandler' catches it and sends a consistent JSON response.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom Error class for operational/business errors.
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  
  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

/**
 * Global error handler middleware.
 * Positioned last in the chain to catch all errors.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle AppError (Expected business errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }
  
  // Handle Unexpected System Errors (Bugs)
  console.error(' [Unexpected Error] ', err);
  
  return res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred on the server',
  });
};
