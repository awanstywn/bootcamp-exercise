/**
 * @fileoverview product.controller.ts
 * @module controllers/product.controller.ts
 * @description Express controller for handling product API requests.
 */
import { Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { ApiResponse } from '../types/api.js';

export class ProductController {
  /**
   * Get all products with optional filters
   * @param req - Express Request (query contains search, categoryId)
   * @param res - Express Response
   */
  static async getAll(req: Request, res: Response) {
    const { categoryId, search } = req.query;
    const products = await ProductService.getAll({
      categoryId: categoryId as string,
      search: search as string,
    });
    const response: ApiResponse = {
      success: true,
      message: 'Products retrieved',
      data: { products },
    };
    res.json(response);
  }

  /**
   * Get a specific product by ID
   * @param req - Express Request (params contains id)
   * @param res - Express Response
   */
  static async getById(req: Request, res: Response) {
    const product = await ProductService.getById(req.params.id as string);
    const response: ApiResponse = {
      success: true,
      message: 'Product retrieved',
      data: { product },
    };
    res.json(response);
  }

  /**
   * Create a new product with optional image upload
   * @param req - Express Request (body contains product data, file contains image)
   * @param res - Express Response
   */
  static async create(req: Request, res: Response) {
    const product = await ProductService.create(req.body, req.file);
    const response: ApiResponse = {
      success: true,
      message: 'Product created',
      data: { product },
    };
    res.status(201).json(response);
  }

  /**
   * Update an existing product
   * @param req - Express Request (params contains id, body contains product data, file contains image)
   * @param res - Express Response
   */
  static async update(req: Request, res: Response) {
    const product = await ProductService.update(req.params.id as string, req.body, req.file);
    const response: ApiResponse = {
      success: true,
      message: 'Product updated',
      data: { product },
    };
    res.json(response);
  }

  /**
   * Delete/deactivate a product
   * @param req - Express Request (params contains id)
   * @param res - Express Response
   */
  static async delete(req: Request, res: Response) {
    await ProductService.delete(req.params.id as string);
    const response: ApiResponse = {
      success: true,
      message: 'Product deleted/deactivated',
    };
    res.json(response);
  }
}
