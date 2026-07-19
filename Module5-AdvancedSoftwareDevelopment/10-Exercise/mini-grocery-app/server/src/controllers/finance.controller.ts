/**
 * @fileoverview finance.controller.ts
 * @module controllers/finance.controller.ts
 * @description Express controller for handling finance API requests.
 */
import { Request, Response } from 'express';
import { FinanceService } from '../services/finance.service.js';
import { ApiResponse } from '../types/api.js';

export class FinanceController {
  /**
   * Get finance summary (Total revenue, orders count)
   * @param req - Express Request (query contains startDate, endDate)
   * @param res - Express Response
   */
  static async getSummary(req: Request, res: Response) {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const summary = await FinanceService.getSummary(startDate, endDate);
    
    const response: ApiResponse = {
      success: true,
      message: 'Finance summary retrieved',
      data: { summary },
    };
    res.json(response);
  }

  /**
   * Get transaction history with date filters
   * @param req - Express Request (query contains startDate, endDate)
   * @param res - Express Response
   */
  static async getTransactionHistory(req: Request, res: Response) {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const transactions = await FinanceService.getTransactionHistory(startDate, endDate);
    
    const response: ApiResponse = {
      success: true,
      message: 'Transaction history retrieved',
      data: { transactions },
    };
    res.json(response);
  }
}
