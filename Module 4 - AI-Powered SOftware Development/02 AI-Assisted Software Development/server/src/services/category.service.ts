/**
 * @fileoverview Business logic for Category management.
 * 
 * Relations:
 * - Consumes: `prisma` for database queries.
 * - Used by: `category.controller.ts`.
 * 
 * Logic:
 * - `getAll` & `getById`: Fetches categories along with a count of their associated products.
 * - `create` & `update`: Prevents duplicate category names by throwing specific domain errors.
 * - `delete`: Implements a strict constraint preventing the deletion of categories that still have linked products.
 */
import { prisma } from '../lib/prisma';
import { CreateCategoryInput, UpdateCategoryInput } from 'shared';

export class CategoryService {
  static async getAll(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string, userId: string) {
    const category = await prisma.category.findUnique({
      where: { id, userId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  static async create(userId: string, data: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { name_userId: { name: data.name, userId } }
    });

    if (existing) {
      throw new Error('Category name already exists');
    }

    return prisma.category.create({
      data: {
        ...data,
        userId
      }
    });
  }

  static async update(id: string, userId: string, data: UpdateCategoryInput) {
    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: { name: data.name, userId, NOT: { id } }
      });

      if (existing) {
        throw new Error('Category name already exists');
      }
    }

    return prisma.category.update({
      where: { id, userId },
      data
    });
  }

  static async delete(id: string, userId: string) {
    // Check for linked products
    const count = await prisma.product.count({
      where: { categoryId: id, userId }
    });

    if (count > 0) {
      throw new Error('Cannot delete category with linked products');
    }

    return prisma.category.delete({
      where: { id, userId }
    });
  }
}
