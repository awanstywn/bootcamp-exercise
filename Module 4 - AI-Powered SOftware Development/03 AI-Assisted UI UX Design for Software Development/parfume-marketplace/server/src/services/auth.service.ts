/**
 * @file auth.service.ts
 * @description Business Logic Service for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for auth.service operations.
 * 
 * @relations
 * Interacts with: jsonwebtoken, crypto, ../lib/prisma, ../lib/hash, shared.
 * 
 * @howItWorks
 * Interacts directly with the database (e.g., Prisma) or external APIs to execute core application rules. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../lib/hash";
import type { RegisterInput, LoginInput, AdminRegisterInput, ForgotPasswordInput, ResetPasswordInput } from "shared";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production";
const ADMIN_REGISTER_SECRET = process.env.ADMIN_REGISTER_SECRET || "";
const RESET_TOKEN_EXPIRY_HOURS = parseInt(process.env.RESET_TOKEN_EXPIRY_HOURS || "1", 10);

function generateToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const error: any = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function registerAdmin(data: AdminRegisterInput) {
  // Validate secret key
  if (data.secretKey !== ADMIN_REGISTER_SECRET) {
    const error: any = new Error("Invalid admin secret key");
    error.statusCode = 403;
    throw error;
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const error: any = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: "ADMIN",
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    const error: any = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    const error: any = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

export async function forgotPassword(data: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: "If an account exists with that email, a password reset link has been generated." };
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // In development, log the reset link
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password?token=${token}`;
  console.log(`\n🔑 Password reset link for ${user.email}:\n   ${resetLink}\n`);

  return { message: "If an account exists with that email, a password reset link has been generated." };
}

export async function resetPassword(data: ResetPasswordInput) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: data.token },
  });

  if (!resetToken) {
    const error: any = new Error("Invalid or expired reset token");
    error.statusCode = 400;
    throw error;
  }

  if (resetToken.used) {
    const error: any = new Error("This reset token has already been used");
    error.statusCode = 400;
    throw error;
  }

  if (resetToken.expiresAt < new Date()) {
    const error: any = new Error("This reset token has expired");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(data.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return { message: "Password has been reset successfully" };
}
