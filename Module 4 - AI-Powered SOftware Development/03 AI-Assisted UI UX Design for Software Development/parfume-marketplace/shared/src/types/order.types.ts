/**
 * @file order.types.ts
 * @description Type Definition for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for order.types operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELED";

export type ShippingMethod = "REGULAR" | "EXPRESS";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  brand: string;
  imageUrl: string;
  price: number;
  volumeMl: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  note: string | null;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentProofUrl: string | null;
  paidAt: string | null;
  userId: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
