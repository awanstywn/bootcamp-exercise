/**
 * @fileoverview Authentication Validation Schemas
 * @objective Validate user registration and login payloads to ensure data integrity and security before processing.
 * @risk Weak password validation can lead to compromised accounts. Invalid email formats cause delivery failures.
 * @relations Used in `auth.routes.ts` via the `validate` middleware.
 * @logic
 * - `registerSchema` enforces email format, a strong password (min 8 chars, 1 uppercase, 1 number), and requires a name.
 * - `loginSchema` enforces email format and requires a password.
 * - Exports TypeScript types inferred from the Zod schemas for type safety in services.
 */
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(100, 'Password is too long'),
  rememberMe: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
