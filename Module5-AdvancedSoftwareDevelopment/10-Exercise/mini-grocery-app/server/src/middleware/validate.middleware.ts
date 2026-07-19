/**
 * @fileoverview validate.middleware.ts
 * @module middleware/validate.middleware.ts
 * @description Express middleware for validate.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<unknown>, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = await schema.parseAsync(req[source]);
      next();
    } catch (error) {
      next(error);
    }
  };
};
