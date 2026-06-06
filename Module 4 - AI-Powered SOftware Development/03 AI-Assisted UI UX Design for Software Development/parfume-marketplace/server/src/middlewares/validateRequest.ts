/**
 * @file validateRequest.ts
 * @description Express Middleware for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for validateRequest operations.
 * 
 * @relations
 * Interacts with: express, zod.
 * 
 * @howItWorks
 * Intercepts incoming HTTP requests to perform validation, authentication, or error handling before passing control to the next handler. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validateRequest(
  schema: ZodSchema,
  target: ValidationTarget = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    // Replace with parsed & validated data
    (req as any)[target] = result.data;
    next();
  };
}
