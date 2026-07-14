/**
 * @fileoverview Token Service
 * @objective Manage the generation, database tracking, and HTTP cookie injection of JWT Access and Refresh tokens.
 * @risk Exposing tokens to XSS attacks if `httpOnly` is not set. Misconfigured expiration times can leave sessions open too long.
 * @relations Called heavily by `auth.controller.ts` and `auth.service.ts`.
 * @logic
 * - `generateAccessToken`: Creates a short-lived (15m) JWT containing the user ID and role.
 * - `generateRefreshToken`: Creates a long-lived (7d) JWT.
 * - `generateTokenPair`: Creates both tokens and crucially stores the refresh token in the `RefreshToken` database table to allow revocation.
 * - `setCookies`: Injects the tokens into the Express response as `httpOnly`, `secure` (in prod), and `lax` SameSite cookies.
 * - `clearCookies`: Removes the auth cookies to log the user out.
 */
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { randomUUID, createHash } from 'crypto';
import { env } from '../config/env.js';
import prisma from '../db/prisma.js';
import { Role } from '@prisma/client';

export class TokenService {
  static generateAccessToken(userId: string, role: Role): string {
    return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  }

  static generateRefreshToken(userId: string, tokenId: string): string {
    return jwt.sign({ userId, tokenId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  static async generateTokenPair(userId: string, role: Role) {
    const accessToken = this.generateAccessToken(userId, role);
    const tokenId = randomUUID();
    const refreshToken = this.generateRefreshToken(userId, tokenId);

    const hashedToken = createHash('sha256').update(refreshToken).digest('hex');

    // Create refresh token record in DB in a single trip
    await prisma.refreshToken.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        token: hashedToken,
      },
    });

    return { accessToken, refreshToken };
  }

  static setCookies(res: Response, accessToken: string, refreshToken: string, rememberMe: boolean = true) {
    const isProd = env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth/refresh',
      ...(rememberMe && { maxAge: 7 * 24 * 60 * 60 * 1000 }), // 7 days if rememberMe, otherwise Session Cookie
    });
  }

  static clearCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  }
}
