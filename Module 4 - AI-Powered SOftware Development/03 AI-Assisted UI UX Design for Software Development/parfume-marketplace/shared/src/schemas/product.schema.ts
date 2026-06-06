/**
 * @file product.schema.ts
 * @description Validation Schema for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for product.schema operations.
 * 
 * @relations
 * Interacts with: zod.
 * 
 * @howItWorks
 * Uses Zod to define rigorous shape and type constraints for data payloads, ensuring robust validation. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { z } from "zod";

export const CategoryEnum = z.enum(["MEN", "WOMEN", "UNISEX"]);
export const ScentFamilyEnum = z.enum([
  "FLORAL", "WOODY", "FRESH", "ORIENTAL",
  "CITRUS", "AQUATIC", "GOURMAND", "AROMATIC",
]);
export const ConcentrationEnum = z.enum(["EDT", "EDP", "PARFUM", "EDC"]);
export const ProductStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(150, "Name too long"),
  brand: z.string().min(1, "Brand is required").max(100, "Brand too long"),
  category: CategoryEnum,
  scentFamily: ScentFamilyEnum,
  notesTop: z.string().min(1, "Top notes are required"),
  notesHeart: z.string().min(1, "Heart notes are required"),
  notesBase: z.string().min(1, "Base notes are required"),
  concentration: ConcentrationEnum,
  price: z.number().min(0, "Price must be non-negative"),
  volumeMl: z.number().int().positive("Volume must be greater than 0"),
  stock: z.number().int().min(0).default(0),
  status: ProductStatusEnum.default("ACTIVE"),
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
});

export const ProductQuerySchema = z.object({
  category: CategoryEnum.optional(),
  scentFamily: ScentFamilyEnum.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["priceAsc", "priceDesc", "latest", "popular"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().optional(),
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
