/**
 * @fileoverview finance.service.ts
 * @module services/finance.service.ts
 * @description Business logic and database operations for finance.
 */
import prisma from '../db/prisma.js';
import { OrderStatus, Prisma } from '@prisma/client';

export class FinanceService {
  /**
   * Calculate summary metrics for verified orders
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Total revenue, total orders, and average order value
   */
  static async getSummary(startDate?: Date, endDate?: Date) {
    const whereClause: Prisma.OrderWhereInput = {
      status: OrderStatus.VERIFIED, // Only count verified (completed) orders as revenue
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
    };
  }

  /**
   * Get a list of transactions (orders) with optional date filters
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns List of orders with associated users
   */
  static async getTransactionHistory(startDate?: Date, endDate?: Date) {
    const whereClause: Prisma.OrderWhereInput = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    return prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }
}
