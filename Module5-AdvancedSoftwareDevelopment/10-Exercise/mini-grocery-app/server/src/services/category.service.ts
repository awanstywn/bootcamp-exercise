/**
 * @fileoverview category.service.ts
 * @module services/category.service.ts
 * @description Business logic and database operations for category.
 */
import prisma from '../db/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator.js';

export class CategoryService {
  /**
   * Retrieve all categories sorted by name
   * @returns List of categories
   */
  static async getAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Retrieve a category by its ID
   * @param id - Category ID
   * @returns The category
   * @throws NotFoundError if not found
   */
  static async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  /**
   * Retrieve a category by its slug
   * @param slug - Category slug
   * @returns The category
   * @throws NotFoundError if not found
   */
  static async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  /**
   * Create a new category
   * @param data - Category creation payload
   * @returns The created category
   * @throws BadRequestError if slug already exists
   */
  static async create(data: CreateCategoryInput) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestError('Category with this name already exists');
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
  }

  /**
   * Update an existing category
   * @param id - Category ID
   * @param data - Update payload
   * @returns The updated category
   * @throws BadRequestError if new name creates a conflicting slug
   */
  static async update(id: string, data: UpdateCategoryInput) {
    const category = await this.getById(id);

    let slug = category.slug;
    if (data.name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const existing = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestError('Category with this name already exists');
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
  }

  /**
   * Delete a category if it has no associated products
   * @param id - Category ID
   * @throws BadRequestError if products are still attached
   */
  static async delete(id: string) {
    await this.getById(id);

    // Check if category is used in any products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new BadRequestError('Cannot delete category with associated products');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}
