/**
 * @fileoverview cart.service.ts
 * @module services/cart.service.ts
 * @description Business logic and database operations for cart.
 */
import prisma from '../db/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { CartItemInput, UpdateCartItemInput } from '../validators/cart.validator.js';

export class CartService {
  /**
   * Get or create a cart for a user
   * @param userId - The ID of the user
   * @returns The user's cart including items and products
   */
  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Add a product to the user's cart
   * @param userId - The ID of the user
   * @param data - The productId and quantity to add
   * @returns The newly created or updated CartItem
   * @throws BadRequestError if stock is insufficient
   */
  static async addItem(userId: string, data: CartItemInput) {
    const cart = await this.getCart(userId);

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or inactive');
    }

    if (product.stock < data.quantity) {
      throw new BadRequestError(`Insufficient stock. Available: ${product.stock}`);
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: data.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestError(`Insufficient stock. Available: ${product.stock}`);
      }
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
      },
    });
  }

  /**
   * Update the quantity of an existing item in the cart
   * @param userId - The ID of the user
   * @param productId - The ID of the product
   * @param data - The new quantity
   * @returns The updated CartItem
   * @throws NotFoundError if item isn't in cart
   */
  static async updateItem(userId: string, productId: string, data: UpdateCartItemInput) {
    const cart = await this.getCart(userId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or inactive');
    }

    if (product.stock < data.quantity) {
      throw new BadRequestError(`Insufficient stock. Available: ${product.stock}`);
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!existingItem) {
      throw new NotFoundError('Item not found in cart');
    }

    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: data.quantity },
    });
  }

  /**
   * Remove an item from the cart
   * @param userId - The ID of the user
   * @param productId - The ID of the product to remove
   */
  static async removeItem(userId: string, productId: string) {
    const cart = await this.getCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!existingItem) {
      throw new NotFoundError('Item not found in cart');
    }

    return prisma.cartItem.delete({
      where: { id: existingItem.id },
    });
  }

  /**
   * Clear all items from a user's cart
   * @param userId - The ID of the user
   */
  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    return prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
