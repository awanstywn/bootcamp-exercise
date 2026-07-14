/**
 * @fileoverview Content Validation Schemas
 * @objective Define strict validation rules for creating and updating content like categories, tags, posts, and comments.
 * @risk Loose validation can lead to missing required data (e.g., empty titles) or malicious data injection.
 * @relations Used as arguments in `validate.middleware.ts` inside `content.routes.ts` and `engagement.routes.ts`.
 * @logic
 * - Defines `createCategorySchema`, `createTagSchema` enforcing required names.
 * - Defines `createPostSchema` enforcing title, content, and optionally tags, categories, and cover image URLs.
 * - Defines `.partial()` variations for update schemas, making all fields optional during PUT/PATCH requests.
 */
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name is too long'),
});

export const updateTagSchema = createTagSchema.partial();

export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title is too long'),
  content: z.string().trim().min(1, 'Content is required').max(50000, 'Content is too long'),
  excerpt: z.string().trim().max(500, 'Excerpt is too long').optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  tags: z.array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag name is too long')).optional(), // Array of tag names
  metaTitle: z.string().trim().max(60, 'Keep meta title under 60 characters').optional(),
  metaDescription: z.string().trim().max(160, 'Keep meta description under 160 characters').optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).optional(),
  scheduledAt: z.string().datetime({ message: 'Invalid ISO date string' }).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(2000, 'Comment is too long'),
  parentId: z.string().cuid('Invalid parent ID').optional(), // For threaded replies
});
