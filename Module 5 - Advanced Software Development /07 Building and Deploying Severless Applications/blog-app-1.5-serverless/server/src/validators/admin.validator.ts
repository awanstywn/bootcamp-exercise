/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'AUTHOR', 'SUBSCRIBER'])
});

export const updateRoleRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});
