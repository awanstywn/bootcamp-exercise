/**
 * @fileoverview product.service.ts
 * @module services/product.service.ts
 * @description Business logic and database operations for product.
 */
import prisma from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator.js';

export class ProductService {
  /**
   * Get all products with optional filters
   * @param params - Filter parameters
   * @returns List of products
   */
  static async getAll(params?: { categoryId?: string, search?: string }) {
    const products = await prisma.product.findMany({
      where: {
        categoryId: params?.categoryId,
        name: params?.search ? { contains: params.search, mode: 'insensitive' } : undefined,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  /**
   * Get a product by its ID
   * @param id - Product ID
   * @returns The product
   * @throws NotFoundError if not found
   */
  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Get a product by its slug
   * @param slug - Product slug
   * @returns The product
   * @throws NotFoundError if not found
   */
  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create a new product
   * @param data - Product data
   * @param file - Optional uploaded image file
   * @returns The newly created product
   */
  static async create(data: CreateProductInput, file?: Express.Multer.File) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        unit: data.unit,
        categoryId: data.categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    return newProduct;
  }

  /**
   * Update an existing product
   * @param id - Product ID
   * @param data - Product update data
   * @param file - Optional uploaded image file
   * @returns The updated product
   */
  static async update(id: string, data: UpdateProductInput, file?: Express.Multer.File) {
    const product = await this.getById(id);

    let slug = product.slug;
    if (data.name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }

    const imageUrl = file ? `/uploads/${file.filename}` : product.imageUrl;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        unit: data.unit,
        categoryId: data.categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    return updatedProduct;
  }

  /**
   * Delete a product or deactivate it if it has dependencies (cart/order items)
   * @param id - Product ID
   */
  static async delete(id: string) {
    await this.getById(id);

    // Check if product is in any carts or orders
    const cartItemsCount = await prisma.cartItem.count({ where: { productId: id } });
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });

    if (cartItemsCount > 0 || orderItemsCount > 0) {
      // Instead of hard delete, just deactivate it.
      return prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.product.delete({
      where: { id },
    });
  }
}
