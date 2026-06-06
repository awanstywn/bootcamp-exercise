/**
 * @fileoverview Zod validation schemas and types for Product inventory.
 * 
 * Relations:
 * - Consumes: `zod`.
 * - Used by: `productStore` (client) and `product.routes` (server).
 * 
 * Logic:
 * - Syncs the `ProductStatus` enum with Prisma's database enum.
 * - Enforces business rules in `CreateProductSchema` (positive price, non-negative stock, valid UUID for category).
 * - Exposes `UpdateProductSchema` to allow partial updates of product fields.
 */
import { z } from 'zod';

// We define our status enum to match the Prisma one
export const ProductStatus = z.enum(['ACTIVE', 'INACTIVE', 'EMPTY']);

// Schema for creating a product
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  status: ProductStatus.optional().default('ACTIVE')
});

// Schema for updating a product (all fields optional)
export const UpdateProductSchema = CreateProductSchema.partial();

// TypeScript types inferred from the schemas
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductStatusType = z.infer<typeof ProductStatus>;
