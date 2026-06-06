/**
 * @file order.schema.ts
 * @description Validation Schema for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for order.schema operations.
 * 
 * @relations
 * Interacts with: zod.
 * 
 * @howItWorks
 * Uses Zod to define rigorous shape and type constraints for data payloads, ensuring robust validation. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
]);

export const ShippingMethodEnum = z.enum(["REGULAR", "EXPRESS"]);

const OrderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const OrderCreateSchema = z.object({
  customerName: z.string().min(1, "Name is required").max(150),
  customerEmail: z.string().email("Invalid email format"),
  customerPhone: z.string().min(8, "Phone number is required").max(30),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required").max(100),
  province: z.string().min(1, "Province is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(10),
  note: z.string().optional(),
  shippingMethod: ShippingMethodEnum.default("REGULAR"),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
});

export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusEnum,
});

export const OrderQuerySchema = z.object({
  status: OrderStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type OrderCreateInput = z.infer<typeof OrderCreateSchema>;
export type OrderStatusUpdateInput = z.infer<typeof OrderStatusUpdateSchema>;
export type OrderQueryInput = z.infer<typeof OrderQuerySchema>;
