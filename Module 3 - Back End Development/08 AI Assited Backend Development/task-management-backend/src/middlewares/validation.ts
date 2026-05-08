/**
 * @fileoverview Express middleware for request payload validation.
 * @objective To sanitize and validate incoming HTTP request bodies and query parameters using `express-validator`.
 * @logic
 * 1. `validateRequest`: A higher-order function that takes a list of validation chains, executes them, and intercepts the request if any validation errors occur, returning a 400 Bad Request.
 * 2. `authValidation`: Validation rules for user registration and login (email format, password length, etc.).
 * 3. `taskValidation`: Validation rules for task creation and updates (title constraints, status, priority, and date formatting).
 * 4. `paginationValidation`: Validation rules for pagination queries (page number and limit constraints).
 */
import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg).join(', ');
      sendError(res, errorMessages, 400);
      return;
    }

    next();
  };
};

export const authValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name')
    .optional()
    .isString()
    .trim()
    .withMessage('Name must be a string'),
];

export const taskValidation = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be 1-255 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
];

export const paginationValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
