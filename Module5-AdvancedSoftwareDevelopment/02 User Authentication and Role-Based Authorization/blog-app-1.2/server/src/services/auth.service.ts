/**
 * @fileoverview Authentication Service
 * @objective Encapsulate the core business logic for user registration, login, token refresh, and third-party OAuth.
 * @risk Contains sensitive logic (password hashing/comparison). Logic bugs here can compromise the entire application's security.
 * @relations Called by `auth.controller.ts`. Interacts with `TokenService` and `prisma`.
 * @logic
 * - `register`: Checks for existing email, hashes password with bcrypt, creates user, and generates tokens.
 * - `login`: Validates credentials (email existence and password match) and generates tokens.
 * - `refresh`: Verifies the refresh token, checks the DB for revocation/rotation, revokes the old token, and generates a new pair.
 * - `logout`: Marks the specific refresh token as revoked in the DB.
 * - `googleOAuth`: Finds or creates a user based on their Google profile, linking their `googleId` and generating tokens.
 */
import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { TokenService } from './token.service.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class AuthService {
  static async register(input: RegisterInput) {
    if (!input.email || !input.password || !input.name) {
      throw new BadRequestError('Email, password, and name are required');
    }

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        passwordHash,
      },
    });

    const tokens = await TokenService.generateTokenPair(user.id, user.role);
    return { user, tokens };
  }

  static async login(input: LoginInput) {
    if (!input.email || !input.password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase().trim() } });
    if (!user || !user.passwordHash) {
      // Dummy compare to prevent timing attacks
      await bcrypt.compare(input.password, '$2b$10$dummyHashThatIs60CharsLong12345678901234567890123');
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await TokenService.generateTokenPair(user.id, user.role);
    return { user, tokens };
  }

  static async refresh(refreshToken: string) {
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const record = await prisma.refreshToken.findUnique({
        where: { token: hashedToken },
        include: { user: true },
      });

      if (!record) {
        throw new Error('Invalid refresh token');
      }

      if (record.revoked) {
        // Token reuse detected - revoke ALL active sessions for this user
        await prisma.refreshToken.updateMany({
          where: { userId: record.userId },
          data: { revoked: true },
        });
        throw new Error('Refresh token reuse detected. All sessions revoked.');
      }

      // Revoke the old token (rotation)
      await prisma.refreshToken.update({
        where: { id: record.id },
        data: { revoked: true },
      });

      // Generate new pair
      const tokens = await TokenService.generateTokenPair(record.userId, record.user.role);
      return tokens;
    } catch (_e) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.update({
        where: { token: hashedToken },
        data: { revoked: true },
      });
    } catch (_e) {
      // Ignore invalid token on logout
    }
  }

  static async googleOAuth(profile: { email: string; name: string; id: string; picture?: string }) {
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatarUrl: profile.picture,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id, avatarUrl: user.avatarUrl || profile.picture },
      });
    }

    const tokens = await TokenService.generateTokenPair(user.id, user.role);
    return { user, tokens };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
