/**
 * @fileoverview Zod validation schemas and types for Authentication and User Profiles.
 * 
 * Relations:
 * - Consumes: `zod` for schema definition.
 * - Used by: Client-side auth forms (React hooks) and Server-side auth routes (validation middleware).
 * 
 * Logic:
 * - Defines `RegisterSchema`, `LoginSchema`, and `UpdateProfileSchema` to enforce strict input boundaries (e.g. email format, password length).
 * - Exports inferred TypeScript types to keep frontend state and backend payloads perfectly synced.
 */
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
