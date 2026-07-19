/**
 * @fileoverview errors.ts
 * @module utils/errors.ts
 * @description Handles logic for errors.ts
 */
/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode: string = 'ERR_INTERNAL',
    public isOperational: boolean = true, // true = expected error (e.g. bad input). false = bug
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'ERR_NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'ERR_UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'ERR_FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(400, message, 'ERR_BAD_REQUEST', true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message, 'ERR_CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: unknown) {
    super(422, message, 'ERR_VALIDATION', true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details?: unknown) {
    super(500, message, 'ERR_DATABASE', false, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service failed', details?: unknown) {
    super(502, message, 'ERR_EXTERNAL_SERVICE', false, details);
  }
}
