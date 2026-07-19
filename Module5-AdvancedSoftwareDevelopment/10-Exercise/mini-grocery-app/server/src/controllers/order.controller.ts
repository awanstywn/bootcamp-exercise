/**
 * @fileoverview order.controller.ts
 * @module controllers/order.controller.ts
 * @description Express controller for handling order API requests.
 */
import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import { ApiResponse } from '../types/api.js';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  /**
   * Process checkout from user's cart
   * @param req - Express Request (body contains deliveryMethod, shippingAddress)
   * @param res - Express Response
   */
  static async checkout(req: Request, res: Response) {
    const order = await OrderService.checkout(req.user!.id, req.body);
    const response: ApiResponse = {
      success: true,
      message: 'Checkout successful',
      data: { order },
    };
    res.status(201).json(response);
  }

  /**
   * Upload payment proof for a pending order
   * @param req - Express Request (params contains id, file contains image)
   * @param res - Express Response
   */
  static async uploadPaymentProof(req: Request, res: Response) {
    if (!req.file) {
      const resp: ApiResponse = { success: false, message: 'Payment proof image is required' };
      res.status(400).json(resp);
      return;
    }

    const order = await OrderService.uploadPaymentProof(req.user!.id, req.params.id as string, req.file);
    const response: ApiResponse = {
      success: true,
      message: 'Payment proof uploaded',
      data: { order },
    };
    res.json(response);
  }

  /**
   * Retrieve all orders for the current user
   * @param req - Express Request
   * @param res - Express Response
   */
  static async getMyOrders(req: Request, res: Response) {
    const orders = await OrderService.getMyOrders(req.user!.id);
    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved',
      data: { orders },
    };
    res.json(response);
  }

  /**
   * Retrieve all orders across the system (Admin only)
   * @param req - Express Request
   * @param res - Express Response
   */
  static async getAllOrders(req: Request, res: Response) {
    const orders = await OrderService.getAllOrders();
    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved',
      data: { orders },
    };
    res.json(response);
  }

  /**
   * Get specific order details by ID
   * @param req - Express Request (params contains id)
   * @param res - Express Response
   */
  static async getOrderById(req: Request, res: Response) {
    const order = await OrderService.getOrderById(req.params.id as string, req.user!.id, req.user!.role);
    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved',
      data: { order },
    };
    res.json(response);
  }

  /**
   * Update the status of an order (Admin only)
   * @param req - Express Request (params contains id, body contains status)
   * @param res - Express Response
   */
  static async updateStatus(req: Request, res: Response) {
    const { status } = req.body;
    const order = await OrderService.updateStatus(req.params.id as string, status as OrderStatus, req.user!.id);
    const response: ApiResponse = {
      success: true,
      message: 'Order status updated',
      data: { order },
    };
    res.json(response);
  }

  /**
   * Reject an order and restore inventory stock (Admin only)
   * @param req - Express Request (params contains id, body contains rejectionReason)
   * @param res - Express Response
   */
  static async rejectOrder(req: Request, res: Response) {
    const order = await OrderService.rejectOrder(req.params.id as string, req.body, req.user!.id);
    const response: ApiResponse = {
      success: true,
      message: 'Order rejected',
      data: { order },
    };
    res.json(response);
  }

  /**
   * Cancel a pending order (Visitor only)
   * @param req - Express Request (params contains id)
   * @param res - Express Response
   */
  static async cancelOrder(req: Request, res: Response) {
    const order = await OrderService.cancelOrder(req.user!.id, req.params.id as string);
    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled',
      data: { order },
    };
    res.json(response);
  }
}
