// packages/shared/src/types/auth.types.ts
// Shared TypeScript interface for authentication API responses.

import type { User } from './user.types';

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
