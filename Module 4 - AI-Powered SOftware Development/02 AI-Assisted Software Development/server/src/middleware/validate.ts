/**
 * @fileoverview Express middleware for validating request bodies using Zod schemas.
 * 
 * Relations:
 * - Consumes: `zod` schema instances.
 * - Used by: Route definitions (e.g., `auth.routes.ts`) to validate incoming POST/PUT payloads.
 * 
 * Logic:
 * - Accepts a Zod schema and returns an async middleware function.
 * - Parses the `req.body` against the schema.
 * - If valid, calls `next()` to proceed to the controller.
 * - If invalid, catches the `ZodError` and maps it to a standardized 400 Bad Request response 
 *   containing specific field validation errors.
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};
