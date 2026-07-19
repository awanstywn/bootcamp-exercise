/**
 * @fileoverview category.controller.ts
 * @module controllers/category.controller.ts
 * @description Express controller for handling category API requests.
 */
import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';
import { ApiResponse } from '../types/api.js';

export class CategoryController {
  /**
   * Get all categories
   * @param req - Express Request
   * @param res - Express Response
   */
  static async getAll(req: Request, res: Response) {
    const categories = await CategoryService.getAll();
    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved',
      data: { categories },
    };
    res.json(response);
  }

  /**
   * Get a specific category by ID
   * @param req - Express Request (params contains id)
   * @param res - Express Response
   */
  static async getById(req: Request, res: Response) {
    const category = await CategoryService.getById(req.params.id as string);
    const response: ApiResponse = {
      success: true,
      message: 'Category retrieved',
      data: { category },
    };
    res.json(response);
  }

  /**
   * Create a new category
   * @param req - Express Request (body contains category data)
   * @param res - Express Response
   */
  static async create(req: Request, res: Response) {
    const category = await CategoryService.create(req.body);
    const response: ApiResponse = {
      success: true,
      message: 'Category created',
      data: { category },
    };
    res.status(201).json(response);
  }

  /**
   * Update an existing category
   * @param req - Express Request (params contains id, body contains category data)
   * @param res - Express Response
   */
  static async update(req: Request, res: Response) {
    const category = await CategoryService.update(req.params.id as string, req.body);
    const response: ApiResponse = {
      success: true,
      message: 'Category updated',
      data: { category },
    };
    res.json(response);
  }

  /**
   * Delete a category
   * @param req - Express Request (params contains id)
   * @param res - Express Response
   */
  static async delete(req: Request, res: Response) {
    await CategoryService.delete(req.params.id as string);
    const response: ApiResponse = {
      success: true,
      message: 'Category deleted',
    };
    res.json(response);
  }
}
