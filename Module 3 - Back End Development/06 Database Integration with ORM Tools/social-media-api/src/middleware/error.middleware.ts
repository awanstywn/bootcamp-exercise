// src/middleware/error.middleware.ts
// Global error handler — catches ALL errors passed via next(error) from any route or middleware.
// This ensures every error response has a consistent JSON shape, no matter where it originated.
// Express error handling docs: https://expressjs.com/en/guide/error-handling.html

import { Request, Response, NextFunction } from 'express';

// Custom error class that carries an HTTP status code alongside the message.
// Usage: throw new AppError('Email already registered', 409)
// Without this, all errors would default to 500 Internal Server Error.
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);       // Pass message to parent Error class
    this.statusCode = statusCode;
  }
}

// Express identifies error middleware by its 4-parameter signature: (err, req, res, next).
// If you remove any parameter, Express treats it as regular middleware and skips it for errors.
export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction    // Must be declared even if unused — required for the 4-param signature
) => {
  // AppError has statusCode; generic Error does not, so default to 500
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log full error stack in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Consistent JSON response — frontend can always expect { error: string }
  res.status(statusCode).json({
    error: message,
  });
};