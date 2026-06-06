/**
 * @fileoverview TypeScript type definitions for augmenting the Express namespace.
 * 
 * Relations:
 * - Consumes: `User` type from `@prisma/client`.
 * - Used by: Global TypeScript context across the `server` layer.
 * 
 * Logic:
 * - Uses declaration merging to add an optional `user` property to the Express `Request` interface.
 * - This prevents TypeScript compilation errors when the `auth` middleware injects `req.user`.
 */
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
