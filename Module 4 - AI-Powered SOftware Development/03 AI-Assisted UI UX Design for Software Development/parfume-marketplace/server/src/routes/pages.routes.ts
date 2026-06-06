/**
 * @file pages.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for pages.routes operations.
 * 
 * @relations
 * Interacts with: express, ../controllers/pages.controller.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { getPageBySlug } from "../controllers/pages.controller";

const router = Router();

router.get("/:slug", getPageBySlug);

export default router;
