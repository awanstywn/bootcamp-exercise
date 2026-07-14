/**
 * @fileoverview Custom Application Errors
 * @objective Provide semantic error classes representing common HTTP error states.
 * @risk None. These are lightweight data structures.
 * @relations Used extensively in services and controllers to throw predictable errors that the global `errorMiddleware` can catch and serialize correctly.
 * @logic
 * - Each class extends the base `AppError`.
 * - Hardcodes the corresponding HTTP status code (404, 401, 403, 400).
 * - Allows overriding the default error message via the constructor.
 */
import { AppError } from '../middleware/error.middleware.js';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}
