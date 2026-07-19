/**
 * @fileoverview cart.controller.ts
 * @module controllers/cart.controller.ts
 * @description Express controller for handling cart API requests.
 */
import { Request, Response } from 'express';
import { CartService } from '../services/cart.service.js';
import { ApiResponse } from '../types/api.js';

export class CartController {
  /**
   * Get the current user's cart
   * @param req - Express Request
   * @param res - Express Response
   */
  static async getCart(req: Request, res: Response) {
    const cart = await CartService.getCart(req.user!.id);
    const response: ApiResponse = {
      success: true,
      message: 'Cart retrieved',
      data: { cart },
    };
    res.json(response);
  }

  /**
   * Add a product to the cart
   * @param req - Express Request (body contains productId and quantity)
   * @param res - Express Response
   */
  static async addItem(req: Request, res: Response) {
    await CartService.addItem(req.user!.id, req.body);
    const response: ApiResponse = {
      success: true,
      message: 'Item added to cart',
    };
    res.status(201).json(response);
  }

  /**
   * Update the quantity of an item in the cart
   * @param req - Express Request (params contains productId, body contains quantity)
   * @param res - Express Response
   */
  static async updateItem(req: Request, res: Response) {
    await CartService.updateItem(req.user!.id, req.params.productId as string, req.body);
    const response: ApiResponse = {
      success: true,
      message: 'Cart item updated',
    };
    res.json(response);
  }

  /**
   * Remove an item completely from the cart
   * @param req - Express Request (params contains productId)
   * @param res - Express Response
   */
  static async removeItem(req: Request, res: Response) {
    await CartService.removeItem(req.user!.id, req.params.productId as string);
    const response: ApiResponse = {
      success: true,
      message: 'Item removed from cart',
    };
    res.json(response);
  }

  /**
   * Clear all items from the cart
   * @param req - Express Request
   * @param res - Express Response
   */
  static async clearCart(req: Request, res: Response) {
    await CartService.clearCart(req.user!.id);
    const response: ApiResponse = {
      success: true,
      message: 'Cart cleared',
    };
    res.json(response);
  }
}
