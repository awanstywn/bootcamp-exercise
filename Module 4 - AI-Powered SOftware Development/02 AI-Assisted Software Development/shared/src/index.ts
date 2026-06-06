/**
 * @fileoverview Entry point for the shared package exporting Zod schemas and TypeScript interfaces.
 * 
 * Relations:
 * - Consumes: Internal schema modules (product, category, auth).
 * - Used by: Both `client` and `server` packages via the `shared` workspace dependency.
 * 
 * Logic:
 * - Aggregates and re-exports all domain models and validation schemas so consumers can import them from a single 'shared' package.
 */
export * from './schemas/product.schema';
export * from './schemas/category.schema';
export * from './schemas/auth.schema';
