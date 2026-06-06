/**
 * @file auth.types.ts
 * @description Type Definition for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for auth.types operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
