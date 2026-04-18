/**
 * Sanitize Utility
 * 
 * This module provides security-focused utility functions to sanitize inputs
 * and prevent vulnerabilities like Cross-Site Scripting (XSS) and malformed URLs.
 */

import { HttpError } from "../types/index.js";

/**
 * Escapes characters that have special meaning in HTML.
 * This is crucial for preventing XSS attacks when rendering user-provided data directly into HTML.
 * 
 * @param str The raw string potentially containing HTML special characters
 * @returns A safe string with HTML entities replaces
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates and sanitizes a URL.
 * It ensures that the URL is properly formatted and only uses safe protocols (http/https).
 * 
 * @param url The target URL string to validate
 * @returns The original URL if valid
 * @throws HttpError if the URL is malformed or uses an unsupported protocol
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow standard web protocols to prevent things like 'javascript:' execution
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new HttpError(400, "Unsupported URL protocol. Only http and https are allowed.");
    }
    return url;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    // URL constructor throws TypeError for malformed URLs
    throw new HttpError(400, "Invalid URL format.");
  }
}

/**
 * Validates a slug format.
 * Slugs should only contain alphanumeric characters, hyphens, and underscores.
 * Length is restricted from 1 to 50 characters limits boundaries.
 * 
 * @param slug The slug string to check
 * @returns True if the slug is valid, otherwise false.
 */
export function isValidSlug(slug: string): boolean {
  // Regex: exactly matching 1 to 50 allowed characters
  return /^[a-zA-Z0-9_-]{1,50}$/.test(slug);
}
