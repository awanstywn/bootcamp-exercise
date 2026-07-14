/**
 * @fileoverview Request Validation Middleware
 * @objective Safely validate incoming request payloads (body, query, params) against predefined Zod schemas.
 * @risk Bypassing this middleware might allow malformed data to enter the system and cause runtime errors or database corruption.
 * @relations Used across route definitions. Depends on `zod` for schema definition.
 * @logic
 * - Higher-order function taking a Zod schema and an optional `source` ('body' by default).
 * - Tries to parse and strictly cast the request data `req[source]` using `schema.parse()`.
 * - If validation fails, it catches the `ZodError` and immediately returns a 400 Bad Request with the validation details.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = await schema.parseAsync(req[source]);
      next();
    } catch (error) {
      next(error);
    }
  };
};
