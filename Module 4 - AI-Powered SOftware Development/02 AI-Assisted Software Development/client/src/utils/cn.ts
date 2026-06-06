/**
 * @fileoverview Utility for dynamically constructing Tailwind CSS class names.
 * 
 * Relations:
 * - Consumes: `clsx` and `tailwind-merge`.
 * - Used by: Reusable UI components (like `Button.tsx`, `Badge.tsx`, `Input.tsx`) to handle conditional classes.
 * 
 * Logic:
 * - Combines multiple class strings/objects using `clsx`.
 * - Merges conflicting Tailwind classes intelligently using `twMerge` (e.g., overriding `bg-blue-500` with `bg-red-500`).
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
