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
