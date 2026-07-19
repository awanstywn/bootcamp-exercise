/**
 * @fileoverview order.service.ts
 * @module services/order.service.ts
 * @description Business logic and database operations for order.
 */
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db/prisma.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import { CreateOrderInput, RejectOrderInput } from '../validators/order.validator.js';

export class OrderService {
  /**
   * Checkout a user's cart and create an order (wrapped in transaction)
   * @param userId - ID of the user
   * @param data - Checkout details (delivery method, etc.)
   * @returns The newly created order
   * @throws BadRequestError for empty cart or insufficient stock
   */
  static async checkout(userId: string, data: CreateOrderInput) {
    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new BadRequestError(`Product ${item.product.name} is inactive`);
        }
        if (item.product.stock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for ${item.product.name}`);
        }

        const subtotal = Number(item.product.price) * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: item.productId,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal,
        });

        // Decrease stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          deliveryMethod: data.deliveryMethod,
          shippingAddress: data.shippingAddress,
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  /**
   * Upload payment proof for a pending order
   * @param userId - ID of the user
   * @param orderId - ID of the order
   * @param file - Uploaded image file
   * @returns The updated order
   * @throws NotFoundError or ForbiddenError
   */
  static async uploadPaymentProof(userId: string, orderId: string, file: Express.Multer.File) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestError('Order is not pending payment');
    }

    const imageUrl = `/uploads/${file.filename}`;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: imageUrl,
        status: OrderStatus.WAITING_VERIFICATION,
        paidAt: new Date(),
      },
    });
  }

  /**
   * Get all orders for a specific user
   * @param userId - ID of the user
   * @returns List of orders
   */
  static async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  /**
   * Get all orders in the system (Admin only)
   * @returns List of orders
   */
  static async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: { select: { name: true, email: true } } },
    });
  }

  /**
   * Get a specific order by ID
   * @param orderId - ID of the order
   * @param userId - ID of the requesting user
   * @param role - Role of the requesting user
   * @returns The order
   * @throws ForbiddenError if visitor requests another user's order
   */
  static async getOrderById(orderId: string, userId: string, role: UserRole) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { name: true, email: true } } },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (role === UserRole.VISITOR && order.userId !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    return order;
  }

  /**
   * Update the status of an order (Admin only)
   * @param orderId - ID of the order
   * @param status - New order status
   * @param adminId - ID of the admin verifying
   * @returns The updated order
   */
  static async updateStatus(orderId: string, status: OrderStatus, adminId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found');

    const updateData: Prisma.OrderUpdateInput = { status };
    if (status === OrderStatus.VERIFIED) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = { connect: { id: adminId } };
    }

    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  /**
   * Reject an order and restore product stock (Admin only, wrapped in transaction)
   * @param orderId - ID of the order
   * @param data - Rejection details
   * @param adminId - ID of the admin rejecting
   * @returns The updated order
   */
  static async rejectOrder(orderId: string, data: RejectOrderInput, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundError('Order not found');

      if (order.status !== OrderStatus.WAITING_VERIFICATION) {
        throw new BadRequestError('Only orders waiting verification can be rejected');
      }

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.REJECTED,
          rejectionReason: data.rejectionReason,
          verifiedById: adminId,
          verifiedAt: new Date(),
        },
      });
    });
  }

  /**
   * Cancel an order and restore product stock (Visitor only, wrapped in transaction)
   * @param userId - ID of the user
   * @param orderId - ID of the order
   * @returns The cancelled order
   */
  static async cancelOrder(userId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundError('Order not found');
      if (order.userId !== userId) throw new ForbiddenError('Not authorized');

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new BadRequestError('Only pending orders can be cancelled');
      }

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });
    });
  }
}
