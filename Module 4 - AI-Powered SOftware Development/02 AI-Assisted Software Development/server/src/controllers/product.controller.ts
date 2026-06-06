/**
 * @fileoverview Controller for Product inventory endpoints.
 * 
 * Relations:
 * - Consumes: `ProductService`.
 * - Used by: `product.routes.ts`.
 * 
 * Logic:
 * - Maps RESTful operations (GET, POST, PUT, DELETE) to product service functions.
 * - For `getAll`, it passes query parameters `req.query` directly to the service for pagination/filtering.
 * - Handles mapping specific product errors (e.g., SKU collision) to HTTP 409 Conflict.
 */
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getAll(req.user!.id, req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ProductService.getStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById(req.params.id, req.user!.id);
      res.json(product);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create(req.user!.id, req.body);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.message === 'Product SKU already exists') {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.update(req.params.id, req.user!.id, req.body);
      res.json(product);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ message: 'Product not found' });
      } else if (error.message === 'Product SKU already exists') {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ message: 'Product not found' });
      } else {
        next(error);
      }
    }
  }
}
