/**
 * @fileoverview Controller for Authentication-related endpoints.
 * 
 * Relations:
 * - Consumes: `AuthService` to execute business logic.
 * - Used by: `auth.routes.ts` which maps HTTP routes to these static methods.
 * 
 * Logic:
 * - Parses incoming HTTP requests and delegates to the service layer.
 * - Formats HTTP responses (201 Created for register, 200 OK for login).
 * - Catches domain-specific errors (like "Email already registered") and maps them to standard HTTP status codes (e.g. 409 Conflict, 401 Unauthorized).
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error: any) {
      if (error.message === 'Email is already registered') {
        res.status(409).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async me(req: Request, res: Response) {
    // req.user is set by the auth middleware
    res.json({ user: req.user });
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }
}
