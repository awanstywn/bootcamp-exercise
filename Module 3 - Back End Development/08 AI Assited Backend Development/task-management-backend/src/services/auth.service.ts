/**
 * @fileoverview Authentication business logic service.
 * @objective To encapsulate the core business logic for user registration, authentication, and profile management.
 * @logic
 * 1. `register`: Checks for existing emails, hashes the provided password, creates a new user record in the database via Prisma, and generates a JWT.
 * 2. `login`: Looks up a user by email, verifies the provided password against the stored hash, and issues a JWT upon successful authentication.
 * 3. `getProfile`: Retrieves a user's safe profile information (excluding the password) using their unique identifier.
 * 4. Throws custom `AppError` instances for validation failures (e.g., email taken, invalid credentials) to be caught by the global error handler.
 */
import { prisma } from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordMatch = await comparePassword(input.password, user.password);

    if (!passwordMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }
}

export const authService = new AuthService();
