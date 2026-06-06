/**
 * @file index.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for index operations.
 * 
 * @relations
 * Interacts with: express, ./auth.routes, ./products.routes, ./orders.routes, ./admin.routes.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import authRoutes from "./auth.routes";
import productsRouter from "./products.routes";
import ordersRouter from "./orders.routes";
import adminRouter from "./admin.routes";
import settingsRouter from "./settings.routes";
import pagesRouter from "./pages.routes";
import addressesRouter from "./addresses.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/settings", settingsRouter);
router.use("/pages", pagesRouter);
router.use("/users/addresses", addressesRouter);
router.use("/admin", adminRouter);

export default router;
