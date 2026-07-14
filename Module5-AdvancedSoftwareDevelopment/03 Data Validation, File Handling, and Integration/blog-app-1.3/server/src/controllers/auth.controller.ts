/**
 * @fileoverview Authentication Controller
 * @objective Handle incoming HTTP requests for user authentication (register, login, logout, refresh, Google OAuth).
 * @risk Improper token handling or failing to strip sensitive user data (like passwords) before sending responses can lead to security breaches.
 * @relations Receives requests from `auth.routes.ts` and delegates business logic to `AuthService` and `TokenService`.
 * @logic
 * - `register`/`login`: Calls `AuthService` to validate and authenticate the user, sets HTTP-only cookies via `TokenService`, and returns safe user data (stripping password hash).
 * - `refresh`: Reads the refresh token from cookies, validates it via `AuthService`, and issues new tokens.
 * - `logout`: Clears the refresh token from the database and clears cookies from the client.
 * - `getMe`: Retrieves the currently authenticated user's profile.
 * - `googleCallback`: Simulates Google OAuth flow, extracting profile data and passing it to `AuthService.googleOAuth`.
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { TokenService } from '../services/token.service.js';
import { UnauthorizedError, BadRequestError } from '../utils/errors.js';
import { User } from '@prisma/client';

export function toSafeUser(user: User) {
  const { id, email, name, role, bio, avatarUrl, createdAt, updatedAt } = user;
  return { id, email, name, role, bio, avatarUrl, createdAt, updatedAt };
}

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.register(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) throw new BadRequestError('Verification token is required');
      
      const { user, tokens } = await AuthService.verifyEmail(token);
      TokenService.setCookies(res, tokens.accessToken, tokens.refreshToken);

      const safeUser = toSafeUser(user);
      res.status(201).json({ message: 'Email verified and account created successfully', user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { rememberMe, ...loginData } = req.body;
      const { user, tokens } = await AuthService.login(loginData);
      TokenService.setCookies(res, tokens.accessToken, tokens.refreshToken, rememberMe);

      const safeUser = toSafeUser(user);
      res.json({ message: 'Logged in successfully', user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        throw new UnauthorizedError('No refresh token provided');
      }

      const tokens = await AuthService.refresh(refreshToken);
      TokenService.setCookies(res, tokens.accessToken, tokens.refreshToken);

      res.json({ message: 'Token refreshed' });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.cookies.refresh_token);
      TokenService.clearCookies(res);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('Not authenticated');
      const user = await AuthService.getProfile(req.user.id);

      // BEST PRACTICE: Auto-heal the JWT if the role changed in the database.
      // This ensures 0 performance hit on other API routes while keeping the stateless JWT strictly synchronized with the database!
      if (req.user.role !== user.role) {
        const tokens = await TokenService.generateTokenPair(user.id, user.role);
        TokenService.setCookies(res, tokens.accessToken, tokens.refreshToken);
      }

      const safeUser = toSafeUser(user);
      res.json({ user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        throw new BadRequestError('Google access token is required');
      }

      // Fetch user profile from Google using the access token
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!googleRes.ok) {
        throw new UnauthorizedError('Failed to verify Google token');
      }

      const profile = await googleRes.json();
      
      if (!profile || !profile.email) {
        throw new BadRequestError('Invalid Google profile data');
      }

      // Convert Google's userinfo format to what our service expects
      const formattedProfile = {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      };

      const { user, tokens } = await AuthService.googleOAuth(formattedProfile);
      TokenService.setCookies(res, tokens.accessToken, tokens.refreshToken);

      const safeUser = toSafeUser(user);
      res.json({ message: 'Logged in with Google', user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError('Email is required');
      await AuthService.forgotPassword(email);
      res.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      if (!token || !password) throw new BadRequestError('Token and password are required');
      
      await AuthService.resetPassword(token, password);
      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      next(error);
    }
  }
}
