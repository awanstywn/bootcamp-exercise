/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      id?: string; // NEW: Request ID
      user?: {
        id: string;
        email?: string;
        role: Role;
      };
    }
  }
}
