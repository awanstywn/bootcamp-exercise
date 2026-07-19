/**
 * @fileoverview auth.service.ts
 * @module services/auth.service.ts
 * @description Business logic and database operations for auth.
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../db/prisma.js';
import { env } from '../config/env.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthService {
  /**
   * Register a new user in the database
   * @param data - The user registration payload
   * @returns The created user object (excluding password)
   * @throws BadRequestError if email is already in use
   */
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: UserRole.VISITOR,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Authenticate a user and issue JWT tokens
   * @param data - The login credentials (email, password)
   * @returns User object and auth tokens
   * @throws UnauthorizedError for invalid credentials
   */
  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   * @param userId - ID of the user
   * @param email - Email of the user
   * @param role - Role of the user
   * @returns Access and refresh tokens
   */
  static generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { id: userId, email, role },
      env.JWT_ACCESS_SECRET,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: env.JWT_ACCESS_EXPIRY as any }
    );

    const refreshToken = jwt.sign(
      { id: userId, email, role },
      env.JWT_REFRESH_SECRET,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: env.JWT_REFRESH_EXPIRY as any }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Refresh the access token using a valid refresh token
   * @param token - The refresh token from cookies
   * @returns New tokens and decoded payload
   * @throws UnauthorizedError if token is invalid or expired
   */
  static async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        id: string;
        email: string;
        role: UserRole;
      };
      
      // Generate new tokens
      const tokens = this.generateTokens(decoded.id, decoded.email, decoded.role);
      
      return { decoded, tokens };
    } catch (_error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Get the public profile of a user
   * @param userId - ID of the user
   * @returns User profile data
   * @throws UnauthorizedError if user not found
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }
}
