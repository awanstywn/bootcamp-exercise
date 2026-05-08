// packages/shared/src/schemas/user.schema.ts
// Shared Zod validation schemas for user profile updates.

import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  bio: z.string().optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
