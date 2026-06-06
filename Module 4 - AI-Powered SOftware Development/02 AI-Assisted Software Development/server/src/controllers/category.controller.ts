/**
 * @fileoverview Controller for Category management endpoints.
 * 
 * Relations:
 * - Consumes: `CategoryService`.
 * - Used by: `category.routes.ts`.
 * 
 * Logic:
 * - Handles CRUD HTTP requests for product categories.
 * - Transforms service-level errors (like Prisma's `P2025` for not found, or constraint errors) into proper HTTP responses (404, 409, 400).
 */
import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll(req.user!.id);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getById(req.params.id, req.user!.id);
      res.json(category);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.create(req.user!.id, req.body);
      res.status(201).json(category);
    } catch (error: any) {
      if (error.message === 'Category name already exists') {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.update(req.params.id, req.user!.id, req.body);
      res.json(category);
    } catch (error: any) {
      if (error.code === 'P2025') { // Prisma record not found error
        res.status(404).json({ message: 'Category not found' });
      } else if (error.message === 'Category name already exists') {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ message: 'Category not found' });
      } else if (error.message === 'Cannot delete category with linked products') {
        res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }
}
