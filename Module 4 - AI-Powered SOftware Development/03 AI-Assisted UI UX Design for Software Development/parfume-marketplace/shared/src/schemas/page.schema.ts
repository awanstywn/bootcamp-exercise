/**
 * @file page.schema.ts
 * @description Validation Schema for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for page.schema operations.
 * 
 * @relations
 * Interacts with: zod.
 * 
 * @howItWorks
 * Uses Zod to define rigorous shape and type constraints for data payloads, ensuring robust validation. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { z } from "zod";

export const ContentPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required"),
});

export type ContentPageUpdateInput = z.infer<typeof ContentPageSchema>;
