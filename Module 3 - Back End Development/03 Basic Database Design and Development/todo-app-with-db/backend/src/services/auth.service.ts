/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: services/auth.service.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Service layer for all authentication operations.
 *   Handles business logic: password hashing, credential verification, and JWT generation.
 *
 * RELATIONS:
 *   - routes/auth.routes.ts → Methods used by route handlers
 *   - config/db.ts     → pool.query() to read/write data to the 'users' table
 *   - config/env.ts    → BCRYPT_ROUNDS for hashing, JWT_SECRET for token
 *   - middleware/errorHandler.ts → Throws AppError for business logic failures
 * ═══════════════════════════════════════════════════════════════════════════
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { User, AuthResponse } from '../types/index.js';

export const authService = {
  /**
   * REGISTER — Sign up a new account.
   */
  register: async (name: string, email: string, password: string): Promise<Omit<User, 'password_hash'>> => {
    email = email.toLowerCase();

    // Step 1: Check if the email is already registered
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length > 0) {
      throw new AppError(409, 'EMAIL_TAKEN', 'Email is already registered');
    }

    // Step 2: Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Step 3: Insert new user to the database
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );

    return result.rows[0]; 
  },

  /**
   * LOGIN — Verify credentials and issue a JWT token.
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    email = email.toLowerCase();

    // Step 1: Find user by email
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = $1',
      [email]
    );

    // Step 2: User not found
    if (result.rows.length === 0) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const user: User = result.rows[0];

    // Step 3: Compare input password vs hash in DB
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Step 4: Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  },
};
