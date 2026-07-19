/**
 * @fileoverview order.validator.ts
 * @module validators/order.validator.ts
 * @description Zod schemas and validation logic for order.
 */
import { z } from 'zod';
import { DeliveryMethod } from '@prisma/client';

export const createOrderSchema = z.object({
  deliveryMethod: z.nativeEnum(DeliveryMethod, { errorMap: () => ({ message: 'Invalid delivery method' }) }),
  shippingAddress: z.string().optional(),
}).refine(data => {
  if (data.deliveryMethod === DeliveryMethod.DELIVERY && (!data.shippingAddress || data.shippingAddress.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Shipping address is required for DELIVERY',
  path: ['shippingAddress']
});

export const rejectOrderSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;
