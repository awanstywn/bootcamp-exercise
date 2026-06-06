/**
 * @fileoverview Business logic for User Authentication and Profile Management.
 * 
 * Relations:
 * - Consumes: `prisma` for database queries, `bcrypt` for password hashing, `jsonwebtoken` for signing tokens.
 * - Used by: `auth.controller.ts`.
 * 
 * Logic:
 * - `register`: Hashes password, creates user, throws if email exists. Returns user without password.
 * - `login`: Validates credentials, signs a JWT token with a 7-day expiration.
 * - `updateProfile`: Allows partial updates to the user profile, including safely rehashing the password if changed.
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { RegisterInput, LoginInput, UpdateProfileInput } from 'shared';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword
      }
    });

    // Exclude password from the response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    // Exclude password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
