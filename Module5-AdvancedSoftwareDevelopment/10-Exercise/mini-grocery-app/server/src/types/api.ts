/**
 * @fileoverview api.ts
 * @module types/api.ts
 * @description Handles logic for api.ts
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
