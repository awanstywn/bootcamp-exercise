/**
 * @fileoverview Global Express error handling middleware.
 * 
 * Relations:
 * - Consumes: Standard Express `Error` objects.
 * - Used by: `app.ts` as the final middleware in the request pipeline.
 * 
 * Logic:
 * - Catches any uncaught exceptions or errors passed via `next(err)` from controllers.
 * - Logs the error to the console for debugging.
 * - Sends a generic 500 Internal Server Error (or the specific error message) to the client.
 */
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
};
