// src/controllers/auth.controller.ts
// Auth controller — thin layer that connects routes to services.
// Responsibility: extract data from req → call service → send res.json().
// Controllers must NOT contain business logic (no DB queries, no hashing, no validation).
// All errors are forwarded to the global error handler via next(err).

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

// POST /api/auth/register — create a new user account
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract validated fields from req.body (already validated by Zod middleware)
    const { name, email, password } = req.body;

    // Delegate all business logic to the service layer
    const result = await authService.registerUser(name, email, password);

    // 201 Created — new resource was successfully created
    res.status(201).json({
      message: 'User registered successfully',
      ...result, // Spreads { user, token } into the response
    });
  } catch (err) {
    next(err); // Forward error to global error handler (error.middleware.ts)
  }
};

// POST /api/auth/login — authenticate and return JWT token
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    // 200 OK — request succeeded, no new resource created
    res.status(200).json({
      message: 'Login successful',
      ...result, // Spreads { user, token } into the response
    });
  } catch (err) {
    next(err);
  }
};