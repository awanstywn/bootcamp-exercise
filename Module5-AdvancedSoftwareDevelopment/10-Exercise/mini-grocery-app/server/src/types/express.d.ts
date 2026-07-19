/**
 * @fileoverview express.d.ts
 * @module types/express.d.ts
 * @description Handles logic for express.d.ts
 */
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      params: Record<string, string>;
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
