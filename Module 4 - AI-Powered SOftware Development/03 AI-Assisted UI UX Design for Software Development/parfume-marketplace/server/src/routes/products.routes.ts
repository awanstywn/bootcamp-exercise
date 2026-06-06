/**
 * @file products.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for products.routes operations.
 * 
 * @relations
 * Interacts with: express, ../controllers/products.controller, ../middlewares/validateRequest, shared.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { listProducts, getProductBySlug } from "../controllers/products.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { ProductQuerySchema } from "shared";

const router = Router();

// Public routes only — admin product management is in admin.routes.ts
router.get("/", validateRequest(ProductQuerySchema, "query"), listProducts);
router.get("/:slug", getProductBySlug);

export default router;
