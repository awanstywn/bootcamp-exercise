/**
 * @file orders.controller.ts
 * @description API Controller for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for orders.controller operations.
 * 
 * @relations
 * Interacts with: express, ../services/orders.service.
 * 
 * @howItWorks
 * Extracts request payloads/params, delegates business logic to services, and formats the HTTP response. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";
import * as ordersService from "../services/orders.service";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id || undefined;
    const order = await ordersService.createOrder(req.body, userId);
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await ordersService.getOrdersByUserId((req as any).user.id);
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ordersService.listOrders(req.query as any);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await ordersService.updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await ordersService.cancelOrderByCustomer(
      req.params.id,
      (req as any).user.id
    );
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      const error: any = new Error("Payment proof image is required");
      error.statusCode = 400;
      throw error;
    }

    const proofUrl = `/uploads/${file.filename}`;
    const order = await ordersService.uploadPaymentProof(req.params.id, (req as any).user.id, proofUrl);
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}
