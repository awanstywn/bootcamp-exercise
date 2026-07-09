/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * @module utils/asyncHandler
 * @description Wraps an async Express route handler to automatically catch rejected promises.
 * @relations Wraps all controller methods in `server/src/controllers/`.
 * @logic
 * - Takes an asynchronous function (controller method).
 * - Returns a new Express middleware function.
 * - If the promise resolves, it continues normally.
 * - If the promise rejects (an error is thrown), `.catch(next)` forwards it to `error.middleware.ts`.
 * This eliminates the need for try-catch blocks in controllers.
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
