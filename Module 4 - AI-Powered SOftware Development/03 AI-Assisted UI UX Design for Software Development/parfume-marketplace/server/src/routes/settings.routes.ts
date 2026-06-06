/**
 * @file settings.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for settings.routes operations.
 * 
 * @relations
 * Interacts with: express, ../controllers/settings.controller.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { getSettings } from "../controllers/settings.controller";

const router = Router();

// Public — needed for checkout and order confirmation pages
router.get("/", getSettings);

export default router;
