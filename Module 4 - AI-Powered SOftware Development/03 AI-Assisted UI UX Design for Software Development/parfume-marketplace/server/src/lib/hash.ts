/**
 * @file hash.ts
 * @description Utility/Module for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for hash operations.
 * 
 * @relations
 * Interacts with: bcrypt.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
