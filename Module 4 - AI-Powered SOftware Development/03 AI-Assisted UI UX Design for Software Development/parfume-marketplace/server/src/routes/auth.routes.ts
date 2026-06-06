/**
 * @file auth.routes.ts
 * @description API Route Router for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for auth.routes operations.
 * 
 * @relations
 * Interacts with: express, ../controllers/auth.controller, ../middlewares/validateRequest, ../middlewares/authGuard.
 * 
 * @howItWorks
 * Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Router } from "express";
import { register, login, getMe, registerAdmin, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { authGuard } from "../middlewares/authGuard";
import {
  RegisterSchema,
  LoginSchema,
  AdminRegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "shared";

const router = Router();

router.post("/register", validateRequest(RegisterSchema), register);
router.post("/register-admin", validateRequest(AdminRegisterSchema), registerAdmin);
router.post("/login", validateRequest(LoginSchema), login);
router.post("/forgot-password", validateRequest(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateRequest(ResetPasswordSchema), resetPassword);
router.get("/me", authGuard, getMe);

export default router;
