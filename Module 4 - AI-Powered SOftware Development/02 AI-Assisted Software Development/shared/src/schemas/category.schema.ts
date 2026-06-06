/**
 * @fileoverview Zod validation schemas and types for Category management.
 * 
 * Relations:
 * - Consumes: `zod`.
 * - Used by: `categoryStore` (client) and `category.routes` (server).
 * 
 * Logic:
 * - Defines `CreateCategorySchema` requiring a non-empty name.
 * - Defines `UpdateCategorySchema` as a partial of the create schema, making all fields optional for PATCH/PUT updates.
 */
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required')
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
