/**
 * @file addresses.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for addresses.routes operations.
 * 
 * @relations
 * Interacts with: express, ../middlewares/authGuard.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { authGuard } from "../middlewares/authGuard";
import {
  getAddresses,
  createAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addresses.controller";

const router = Router();

// All address routes require authentication
router.use(authGuard);

router.get("/", getAddresses);
router.post("/", createAddress);
router.delete("/:id", deleteAddress);
router.put("/:id/default", setDefaultAddress);

export default router;
