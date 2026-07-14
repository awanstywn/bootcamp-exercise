/**
 * @fileoverview Slug Generation Utility
 * @objective Convert standard text (like a post title) into a URL-friendly string (slug).
 * @risk If slugs are not properly cleaned, they can cause routing issues or invalid URLs. Duplicate slugs must be handled externally.
 * @relations Used in `content.controller.ts` or `content.service.ts` when creating or updating posts.
 * @logic
 * - Lowercases and trims the input string.
 * - Uses Regex to remove all non-word characters (except spaces and hyphens).
 * - Uses Regex to replace spaces and underscores with hyphens.
 * - Trims leading and trailing hyphens.
 */
export function generateSlug(title: string): string {
  return title
    .normalize('NFD')                     // Split accents from base letters
    .replace(/[\u0300-\u036f]/g, '')      // Remove all the accent marks
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
