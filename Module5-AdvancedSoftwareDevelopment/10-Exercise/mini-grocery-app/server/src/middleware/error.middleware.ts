/**
 * @fileoverview error.middleware.ts
 * @module middleware/error.middleware.ts
 * @description Express middleware for error.
 */
import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
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
    error = new ValidationError('Validation failed', err.issues);
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

  // 2. Format the response using standard format: { success, message, data? }
  if (error instanceof AppError) {
    if (error.isOperational) {
       logger.warn(error.message, { requestId: req.id, code: error.errorCode });
    } else {
       logger.error(error.message, { requestId: req.id, stack: error.stack, code: error.errorCode });
    }

    return res.status(error.statusCode).json({ 
      success: false,
      message: error.message,
      ...(error.details ? { data: error.details } : {}),
    });
  }

  // 3. Fallback for completely unhandled generic errors
  logger.error('Unhandled Error:', { requestId: req.id, stack: err.stack });
  
  return res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
  });
};
