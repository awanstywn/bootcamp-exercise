/**
 * @file admin.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for admin.routes operations.
 * 
 * @relations
 * Interacts with: express, ../middlewares/authGuard, ../middlewares/adminGuard, ../middlewares/validateRequest, ../controllers/orders.controller.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { authGuard } from "../middlewares/authGuard";
import { adminGuard } from "../middlewares/adminGuard";
import { validateRequest } from "../middlewares/validateRequest";
import {
  listAllProducts, createProduct, getProductById, updateProduct,
  updateStock, addProductImages, deleteProductImage, deleteProduct
} from "../controllers/products.controller";
import { listOrders, updateOrderStatus } from "../controllers/orders.controller";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { listPages, updatePage, getPageBySlug } from "../controllers/pages.controller";
import { uploadMultiple } from "../lib/upload";
import { ProductQuerySchema, OrderQuerySchema, OrderStatusUpdateSchema, SettingsUpdateSchema, ContentPageSchema } from "shared";

const router = Router();

// All admin routes require auth + admin role
router.use(authGuard, adminGuard);

// ─── Products ──────────────────────────────────────────────
router.get("/products", validateRequest(ProductQuerySchema, "query"), listAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", uploadMultiple, createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/stock", updateStock);
router.post("/products/:id/images", uploadMultiple, addProductImages);
router.delete("/products/:id/images/:imageId", deleteProductImage);

// ─── Orders ────────────────────────────────────────────────
router.get("/orders", validateRequest(OrderQuerySchema, "query"), listOrders);
router.patch("/orders/:id/status", validateRequest(OrderStatusUpdateSchema), updateOrderStatus);

// ─── Settings ──────────────────────────────────────────────
router.get("/settings", getSettings);
router.put("/settings", validateRequest(SettingsUpdateSchema), updateSettings);

// ─── Pages ─────────────────────────────────────────────────
router.get("/pages", listPages);
router.get("/pages/:slug", getPageBySlug);
router.put("/pages/:slug", validateRequest(ContentPageSchema), updatePage);

export default router;
