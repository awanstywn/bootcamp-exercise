/**
 * @fileoverview product.validator.ts
 * @module validators/product.validator.ts
 * @description Zod schemas and validation logic for product.
 */
import { z } from 'zod';

export enum ProductUnit {
  KG = 'KG',
  PCS = 'PCS',
  LITER = 'LITER',
  PACK = 'PACK',
  GRAM = 'GRAM',
  DOZEN = 'DOZEN',
}

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Category ID is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
  unit: z.nativeEnum(ProductUnit, { errorMap: () => ({ message: 'Invalid product unit' }) }),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
