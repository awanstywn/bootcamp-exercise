// src/middleware/validate.middleware.ts
// Zod validation middleware factory — validates req.body against a schema before reaching the controller.
// Uses the "higher-order function" pattern: validate(schema) returns a middleware function.
// Usage in routes: router.post('/register', validate(registerSchema), controller.register)
// Zod docs: https://zod.dev

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Higher-order function: takes a Zod schema as input, returns an Express middleware function.
// This pattern lets us reuse one function with different schemas for different routes.
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // schema.parse() validates req.body against the schema rules.
      // If valid: returns the parsed (and type-safe) data.
      // If invalid: throws a ZodError with details about which fields failed.
      schema.parse(req.body);
      next(); // Validation passed — proceed to controller
    } catch (err) {
      if (err instanceof ZodError) {
        // Format Zod errors into a frontend-friendly shape: [{ field, message }]
        // Example: [{ field: "email", message: "Invalid email format" }]
        const details = err.errors.map(e => ({
          field: e.path.join('.'),   // Nested paths become "address.city"
          message: e.message,        // Human-readable error from schema definition
        }));
        res.status(400).json({
          error: 'Validation failed',
          details,
        });
      } else {
        next(err); // Non-Zod error — pass to global error handler
      }
    }
  };
};