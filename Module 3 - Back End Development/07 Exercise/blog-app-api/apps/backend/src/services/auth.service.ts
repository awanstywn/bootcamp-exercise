// src/services/auth.service.ts
// Authentication business logic — handles registration, login, and token generation.
// This is where the real work happens: password hashing, credential verification, JWT creation.
// bcrypt docs: https://www.npmjs.com/package/bcrypt
// jsonwebtoken docs: https://www.npmjs.com/package/jsonwebtoken

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

// Salt rounds for bcrypt hashing — higher = more secure but slower.
// 10 is the industry standard for production (each increment doubles computation time).
const SALT_ROUNDS = 10;

// ── Register ───────────────────────────────────────────────────────────────────

// Register a new user: check uniqueness → hash password → save to DB → return token
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  // Check if email is already taken — emails must be unique in the database
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409); // 409 Conflict
  }

  // Hash password before storing — NEVER save plain text passwords!
  // bcrypt.hash() generates a random salt and combines it with the password hash.
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in DB — use `select` to return only safe fields (never return password)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Generate JWT so user is immediately logged in after registration
  const token = generateToken(user.id, user.email);

  return { user, token };
};

// ── Login ──────────────────────────────────────────────────────────────────────

// Login user: find by email → compare password → return token
export const loginUser = async (email: string, password: string) => {
  // Look up user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // Security: use the SAME generic message for "email not found" and "wrong password".
  // This prevents attackers from discovering which emails are registered (email enumeration).
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // bcrypt.compare() hashes the input and compares it with the stored hash.
  // It handles salt extraction automatically — we don't need to store the salt separately.
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401); // Same message — intentional
  }

  const token = generateToken(user.id, user.email);

  // Destructure to exclude password from the response object
  // `_` is a convention for "intentionally unused variable"
  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

// ── Token Generation ───────────────────────────────────────────────────────────

// Create a signed JWT token containing the user's ID and email.
// The token is signed with JWT_SECRET — anyone with this secret can forge tokens, so keep it safe!
const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },                          // Payload — data stored inside the token
    process.env.JWT_SECRET as string,           // Secret key — used to sign and verify
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }  // Expiration — token becomes invalid after this
  );
};