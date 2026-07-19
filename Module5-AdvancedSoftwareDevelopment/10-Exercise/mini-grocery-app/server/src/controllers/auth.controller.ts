/**
 * @fileoverview auth.controller.ts
 * @module controllers/auth.controller.ts
 * @description Express controller for handling auth API requests.
 */
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../types/api.js';

export class AuthController {
  /**
   * Register a new user
   * @param req - Express Request (body contains user details)
   * @param res - Express Response
   */
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(req.body);
    
    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: { user },
    };
    
    res.status(201).json(response);
  }

  /**
   * Authenticate user and issue tokens
   * @param req - Express Request (body contains email, password)
   * @param res - Express Response (sets httpOnly cookies)
   */
  static async login(req: Request, res: Response) {
    const { user, tokens } = await AuthService.login(req.body);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: ApiResponse = {
      success: true,
      message: 'Logged in successfully',
      data: { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    };

    res.status(200).json(response);
  }

  /**
   * Log out user and clear cookies
   * @param req - Express Request
   * @param res - Express Response
   */
  static async logout(req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Refresh authentication tokens using refreshToken cookie
   * @param req - Express Request
   * @param res - Express Response (sets new httpOnly cookies)
   */
  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      const resp: ApiResponse = { success: false, message: 'No refresh token' };
      res.status(401).json(resp);
      return;
    }

    const { tokens } = await AuthService.refresh(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tokens refreshed',
    };

    res.status(200).json(response);
  }

  /**
   * Get current authenticated user's profile
   * @param req - Express Request (requires auth middleware)
   * @param res - Express Response
   */
  static async getMe(req: Request, res: Response) {
    if (!req.user) {
      const resp: ApiResponse = { success: false, message: 'Unauthorized' };
      res.status(401).json(resp);
      return;
    }

    const user = await AuthService.getUserProfile(req.user.id);

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved',
      data: { user },
    };

    res.status(200).json(response);
  }
}
