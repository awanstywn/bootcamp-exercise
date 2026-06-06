/**
 * @fileoverview Business logic for Product inventory management.
 * 
 * Relations:
 * - Consumes: `prisma` for database queries.
 * - Used by: `product.controller.ts`.
 * 
 * Logic:
 * - `getAll`: Implements server-side pagination (page, limit) and complex filtering (search by name/sku, filter by category/status, dynamic sorting). Returns `{ data, meta }`.
 * - `getStats`: Aggregates dashboard metrics (total products, low stock count, etc.) using multiple concurrent Prisma queries.
 * - `create` & `update`: Enforces unique SKU constraints.
 */
import { prisma } from '../lib/prisma';
import { CreateProductInput, UpdateProductInput } from 'shared';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getAll(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = query.search as string;
    const category = query.category as string;
    const status = query.status as string;
    const sortBy = (query.sortBy as string) || 'createdAt';
    const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: Prisma.ProductWhereInput = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status as any;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.product.count({ where })
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getStats(userId: string) {
    const [totalProducts, totalCategories, lowStock, activeProducts] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.category.count({ where: { userId } }),
      prisma.product.count({ where: { stock: { lt: 10 }, userId } }),
      prisma.product.count({ where: { status: 'ACTIVE', userId } })
    ]);

    return {
      totalProducts,
      totalCategories,
      lowStock,
      activeProducts
    };
  }

  static async getById(id: string, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id, userId },
      include: { category: true }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  static async create(userId: string, data: CreateProductInput) {
    // Check if SKU exists
    const existing = await prisma.product.findUnique({
      where: { sku_userId: { sku: data.sku, userId } }
    });

    if (existing) {
      throw new Error('Product SKU already exists');
    }

    return prisma.product.create({
      data: {
        ...data,
        userId,
        status: data.status as any
      },
      include: { category: true }
    });
  }

  static async update(id: string, userId: string, data: UpdateProductInput) {
    if (data.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: data.sku, userId, NOT: { id } }
      });

      if (existing) {
        throw new Error('Product SKU already exists');
      }
    }

    return prisma.product.update({
      where: { id, userId },
      data: {
        ...data,
        status: data.status as any
      },
      include: { category: true }
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.product.delete({
      where: { id, userId }
    });
  }
}
