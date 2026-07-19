/**
 * @fileoverview requestId.middleware.ts
 * @module middleware/requestId.middleware.ts
 * @description Express middleware for requestId.
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = crypto.randomUUID();
  req.id = reqId; // Attach to request for logging
  res.setHeader('X-Request-Id', reqId); // Send back to client
  next();
};
