/**
 * @file cn.ts
 * @description Utility/Module for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for cn operations.
 * 
 * @relations
 * Interacts with: clsx, tailwind-merge.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
