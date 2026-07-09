/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long').optional(),
  bio: z.string().max(500, 'Biography must not exceed 500 characters').optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
