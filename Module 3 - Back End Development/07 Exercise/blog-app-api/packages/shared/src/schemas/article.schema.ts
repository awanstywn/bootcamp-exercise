// packages/shared/src/schemas/article.schema.ts
// Shared Zod validation schemas for article creation and updates.
// Used by the frontend form and backend request validation middleware.

import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  published: z.boolean({ required_error: 'Published status is required' }),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  published: z.boolean().optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
