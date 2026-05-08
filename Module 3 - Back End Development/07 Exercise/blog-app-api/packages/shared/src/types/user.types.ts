// packages/shared/src/types/user.types.ts
// Shared TypeScript interface for User entity.
// Represents the user data structure as returned by the API.

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}
