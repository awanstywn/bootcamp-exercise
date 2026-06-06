/**
 * @file orders.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for orders.routes operations.
 * 
 * @relations
 * Interacts with: express, ../controllers/orders.controller, ../lib/upload, ../middlewares/validateRequest, ../middlewares/authGuard.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { createOrder, getOrderById, getMyOrders, cancelOrder, uploadPaymentProof } from "../controllers/orders.controller";
import { uploadSingle } from "../lib/upload";
import { validateRequest } from "../middlewares/validateRequest";
import { authGuard, optionalAuth } from "../middlewares/authGuard";
import { OrderCreateSchema } from "shared";

const router = Router();

// Public/optional auth — guest checkout supported
router.post("/", optionalAuth, validateRequest(OrderCreateSchema), createOrder);

// Public — anyone with order ID can view their order
router.get("/:id", getOrderById);

// Auth required — user's own orders
router.get("/my/list", authGuard, getMyOrders);

// Auth required — cancel own order
router.patch("/:id/cancel", authGuard, cancelOrder);

// Upload payment proof
router.post("/:id/payment-proof", authGuard, uploadSingle, uploadPaymentProof);

export default router;
