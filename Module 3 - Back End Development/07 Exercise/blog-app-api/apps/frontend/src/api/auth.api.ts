// src/api/auth.api.ts
// Authentication API endpoints — login and register.
// Uses shared types from @blog-app/shared to ensure request/response shapes
// stay in sync with the backend's Zod validation schemas.

import apiClient from './client';
import type { AuthResponse, LoginInput, RegisterInput } from '@blog-app/shared';

export const authApi = {
  login: (data: LoginInput) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterInput) =>
    apiClient.post<AuthResponse>('/auth/register', data),
};
