/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: middleware/validateBody.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Middleware factory for request body validation.
 *   This is a "Factory" because it GENERATES a middleware function.
 *   You provide a list of required fields, and it returns a middleware that
 *   verifies those fields exist in every incoming request.
 *
 * RELATIONS:
 *   - routes/*.routes.ts   → Used in route definitions, for example:
 *                            validateBody(['email', 'password'])
 *   - utils/AppError.ts    → Throws 400 Bad Request if a field is missing or empty
 *
 * HOW IT WORKS:
 *   1. Receives an array of required field names (strings).
 *   2. Returns an Express middleware function (req, res, next).
 *   3. The middleware loops through each required field:
 *      - Checks if the field exists in req.body
 *      - Checks if the value is not empty/whitespace
 *   4. If any field is invalid → Throws AppError 400.
 *   5. If all are valid → calls next().
 *
 * EXAMPLE USAGE:
 *   router.post('/login', validateBody(['email', 'password']), controller.login)
 *   router.post('/todos', validateBody(['text']), controller.create)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

/**
 * Factory function that creates a body validation middleware.
 * 
 * @param requiredFields - Array of field names that MUST be present in req.body
 * @returns Express middleware function
 */
export const validateBody = (requiredFields: string[]) => {
  // Returns middleware function (closure — can access requiredFields from parent scope)
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of requiredFields) {
      const value = req.body[field];
      
      // Checks 3 failure conditions:
      // 1. undefined → field not sent at all
      // 2. null → field sent but is null
      // 3. empty/whitespace string → field sent but has no content
      if (value === undefined || value === null || String(value).trim() === '') {
        throw new AppError(400, 'VALIDATION_ERROR', `The field '${field}' is required`);
      }
    }
    
    // All fields valid → proceed to the next handler
    next();
  };
};
