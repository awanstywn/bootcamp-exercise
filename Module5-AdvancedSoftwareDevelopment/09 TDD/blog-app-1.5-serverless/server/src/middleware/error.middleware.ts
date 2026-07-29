/**
 * @module middleware/error.middleware
 * @description Global Error Handling Middleware that catches all unhandled exceptions and formats a consistent JSON response.
 * @relations Integrated in `server/src/app.ts` as the final middleware. Relies on `AppError` subclasses from `server/src/utils/errors.ts` and logs to `server/src/config/logger.ts`.
 * @logic
 * - Normalizes third-party errors (like ZodError and PrismaClientKnownRequestError) into internal AppError subclasses.
 * - Logs expected (operational) errors as warnings with Request ID.
 * - Logs unexpected bugs/failures as errors with stack traces to Winston.
 * - If the error isn't recognized, logs the stack trace and returns a generic 500 Internal Server Error to prevent leaking sensitive info.
 */
import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { 
  AppError, 
  ValidationError, 
  ConflictError, 
  DatabaseError, 
  NotFoundError 
} from '../utils/errors.js';

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let error = err;

  // 1. Normalize errors from dependencies
  if (err instanceof ZodError) {
    error = new ValidationError('Invalid input data', err.issues);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      error = new ConflictError('A record with this value already exists.');
    } else if (err.code === 'P2025') {
      error = new NotFoundError('Record not found.');
    } else {
      error = new DatabaseError(`Prisma Error: ${err.code}`);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new DatabaseError('Invalid database query.');
  }

  // 2. Format the response
  if (error instanceof AppError) {
    // Expected operational errors
    if (error.isOperational) {
       logger.warn(error.message, { requestId: req.id, code: error.errorCode });
    } else {
       // Programming bugs or external failures
       logger.error(error.message, { requestId: req.id, stack: error.stack, code: error.errorCode });
    }

    return res.status(error.statusCode).json({ 
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        details: error.details || null,
        ...(env.NODE_ENV === 'development' && !error.isOperational && { stack: error.stack })
      }
    });
  }

  // 3. Fallback for completely unhandled generic errors
  logger.error('Unhandled Error:', { requestId: req.id, stack: err.stack });
  
  return res.status(500).json({ 
    success: false,
    error: {
      code: 'ERR_INTERNAL_SERVER',
      message: err.message || 'Internal Server Error',
      details: err.stack,
    }
  });
};
