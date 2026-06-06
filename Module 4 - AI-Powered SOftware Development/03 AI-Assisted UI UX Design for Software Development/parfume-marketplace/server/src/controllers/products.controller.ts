/**
 * @file products.controller.ts
 * @description API Controller for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for products.controller operations.
 * 
 * @relations
 * Interacts with: express, ../services/products.service.
 * 
 * @howItWorks
 * Extracts request payloads/params, delegates business logic to services, and formats the HTTP response. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Request, Response, NextFunction } from "express";
import * as productsService from "../services/products.service";

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productsService.listProducts(req.query as any);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function listAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productsService.listAllProducts(req.query as any);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.getProductBySlug(req.params.slug);
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    // Parse numeric fields from form data
    const body = {
      ...req.body,
      price: parseFloat(req.body.price),
      volumeMl: parseInt(req.body.volumeMl, 10),
      stock: parseInt(req.body.stock || "0", 10),
    };
    const files = req.files as Express.Multer.File[] | undefined;
    const product = await productsService.createProduct(body, files);
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const body = { ...req.body };
    if (body.price) body.price = parseFloat(body.price);
    if (body.volumeMl) body.volumeMl = parseInt(body.volumeMl, 10);
    if (body.stock !== undefined) body.stock = parseInt(body.stock, 10);

    const product = await productsService.updateProduct(req.params.id, body);
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function updateStock(req: Request, res: Response, next: NextFunction) {
  try {
    const stock = parseInt(req.body.stock, 10);
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: "Invalid stock value" });
    }
    const product = await productsService.updateStock(req.params.id, stock);
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function addProductImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }
    const images = await productsService.addProductImages(req.params.id, files);
    res.status(201).json({ success: true, data: { images } });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productsService.deleteProductImage(req.params.imageId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productsService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
