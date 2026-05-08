/**
 * @fileoverview Global error handling middleware and utilities.
 * @objective To provide a unified mechanism for capturing and formatting API errors.
 * @logic
 * 1. `AppError`: A custom error class used to throw operational errors with a specific HTTP status code and message.
 * 2. `errorHandler`: The final Express middleware that catches all errors. It differentiates between known `AppError` instances (sending their specific status code) and unknown errors (logging them and sending a generic 500 status code).
 * 3. `asyncHandler`: A wrapper function for asynchronous route handlers to automatically pass rejected promises (errors) to the `next` function, eliminating the need for repetitive try-catch blocks in routes.
 */
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
  } else {
    console.error('Unhandled error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
