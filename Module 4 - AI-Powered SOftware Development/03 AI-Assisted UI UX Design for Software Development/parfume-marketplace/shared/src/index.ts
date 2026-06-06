/**
 * @file index.ts
 * @description Utility/Module for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for index operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

// Auth Schemas
export {
  RegisterSchema,
  LoginSchema,
  AdminRegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "./schemas/auth.schema";
export type {
  RegisterInput,
  LoginInput,
  AdminRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./schemas/auth.schema";

// Product Schemas
export {
  CategoryEnum,
  ScentFamilyEnum,
  ConcentrationEnum,
  ProductStatusEnum,
  ProductCreateSchema,
  ProductQuerySchema,
} from "./schemas/product.schema";
export type { ProductCreateInput, ProductQueryInput } from "./schemas/product.schema";

// Order Schemas
export {
  OrderStatusEnum,
  ShippingMethodEnum,
  OrderCreateSchema,
  OrderStatusUpdateSchema,
  OrderQuerySchema,
} from "./schemas/order.schema";
export type {
  OrderCreateInput,
  OrderStatusUpdateInput,
  OrderQueryInput,
} from "./schemas/order.schema";

// Settings Schema
export { SettingsUpdateSchema } from "./schemas/settings.schema";
export type { SettingsUpdateInput } from "./schemas/settings.schema";

// Content Page Schema
export { ContentPageSchema } from "./schemas/page.schema";
export type { ContentPageUpdateInput } from "./schemas/page.schema";

// Types
export type { AuthUser, AuthResponse } from "./types/auth.types";
export type { Product, ProductImage, PaginatedResponse } from "./types/product.types";
export type { Order, OrderItem, OrderStatus, ShippingMethod, OrdersResponse } from "./types/order.types";
export type { SiteSettings } from "./types/settings.types";
