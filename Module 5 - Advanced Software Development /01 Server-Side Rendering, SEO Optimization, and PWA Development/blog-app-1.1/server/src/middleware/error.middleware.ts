/**
 * @fileoverview Global Error Handling Middleware
 * @objective Provide a centralized way to handle exceptions and errors across the application, returning a consistent JSON structure.
 * @risk Unhandled exceptions could crash the server or leak stack traces to the client if not caught here.
 * @relations Integrated in `app.ts` as the final middleware. Relies on `AppError` thrown by controllers and services.
 * @logic
 * - Defines a custom `AppError` class extending the native `Error`, adding a `statusCode`.
 * - The `errorMiddleware` function catches all errors passed via `next(err)`.
 * - If the error is an instance of `AppError`, it returns the specific status code and message.
 * - Otherwise, it defaults to a generic 500 Internal Server Error.
 */
import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);

  // 1. Handle Custom AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 2. Handle Prisma Unique Constraint Violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with this value already exists.' });
    }
  }

  // 4. Fallback generic 500
  return res.status(500).json({
    error: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
