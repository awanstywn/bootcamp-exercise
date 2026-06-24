/**
 * @file backendless.ts
 * @description SDK connection config and interface wrapper for Backendless services.
 * Integrates authentication routines and CMS content fetching with robust fallback data handlers.
 */

import Backendless from 'backendless';
import type { Blog, Service, Testimonial } from '@/types';
import {
  FALLBACK_SERVICES,
  FALLBACK_TESTIMONIALS,
  FALLBACK_BLOGS,
} from '@/data/fallback';

// ─── Initialize Backendless ────────────────────────────────────────────────
// Extract credentials from Vite environment variables (defined in .env)
const appId = import.meta.env.VITE_BACKENDLESS_APP_ID ?? '';
const apiKey = import.meta.env.VITE_BACKENDLESS_API_KEY ?? '';

// Check if credentials are properly configured (non-empty and not placeholders)
const isConfigured =
  appId.length > 0 &&
  apiKey.length > 0 &&
  !appId.startsWith('your_') &&
  !apiKey.startsWith('your_');

// If credentials are valid, initialize the Backendless SDK connection
if (isConfigured) {
  Backendless.initApp(appId, apiKey);
}

export default Backendless;

// ─── Auth helpers ──────────────────────────────────────────────────────────

/**
 * Authenticates a user with Backendless database.
 * @param email User email string
 * @param password User password string
 * @returns Promise resolving to the authenticated User object
 */
export const loginUser = (email: string, password: string) =>
  Backendless.UserService.login(email, password, true); // true = stayLoggedIn (uses cookies for persistence)

/**
 * Registers a new user account in Backendless.
 * @param email User email string
 * @param password User password string
 * @param name User's display name
 * @returns Promise resolving to the newly registered User details
 */
export const registerUser = (email: string, password: string, name: string) => {
  const user = new Backendless.User();
  user.email = email;
  user.password = password;
  // Typecast user object to any to allow assigning dynamic fields like 'name' in TypeScript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (user as any).name = name;
  // Set default role to 'user' so it is never blank
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (user as any).role = 'user';
  return Backendless.UserService.register(user);
};

/**
 * Destroys the user session both on Backendless servers and client cookies.
 */
export const logoutUser = () => Backendless.UserService.logout();

/**
 * Attempts to retrieve active user credentials based on local cookies.
 * @returns Promise resolving to User object or null if session expired/unauthenticated
 */
export const getCurrentUser = () => Backendless.UserService.getCurrentUser();

// ─── CMS helpers (with fallback) ──────────────────────────────────────────

/**
 * Commits a new blog post entry to Backendless database.
 * @param data Object containing post title, content, excerpt, authorName, and optional tags.
 */
export const createBlog = (data: {
  title: string;
  content: string;
  excerpt: string;
  authorName: string;
  tags?: string;
  featured?: boolean;
  thumbnail?: string;
}) => Backendless.Data.of('Blog').save({ ...data, published: true });

/**
 * Updates an existing blog post entry.
 * @param objectId The unique ID of the post to update.
 * @param data The fields to update.
 */
export const updateBlog = (objectId: string, data: Partial<Blog>) =>
  Backendless.Data.of('Blog').save({ objectId, ...data });

/**
 * Deletes a blog post entry from the database.
 * @param objectId The unique ID of the post to delete.
 */
export const deleteBlog = (objectId: string) =>
  Backendless.Data.of('Blog').remove({ objectId });

/**
 * Generic wrapper to fetch data from Backendless with a fallback mechanism.
 */
async function fetchWithFallback<T>(
  tableName: string,
  fallbackData: T[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryBuilder?: any
): Promise<T[]> {
  if (!isConfigured) return fallbackData;
  try {
    const qb = queryBuilder || Backendless.DataQueryBuilder.create();
    const results = (await Backendless.Data.of(tableName).find(qb)) as unknown as T[];
    return results.length > 0 ? results : fallbackData;
  } catch {
    return fallbackData;
  }
}

/**
 * Fetches published blog posts sorted by creation date descending.
 * Falls back to static mock data if Backendless is unreachable or unconfigured.
 */
export const fetchBlogs = async (): Promise<Blog[]> => {
  const queryBuilder = Backendless.DataQueryBuilder.create();
  queryBuilder.setSortBy(['created DESC']);
  return fetchWithFallback<Blog>('Blog', FALLBACK_BLOGS, queryBuilder);
};

/**
 * Fetches an individual blog post by its unique objectId.
 * Checks local fallbacks first to support viewing static mock articles.
 */
export const fetchBlogById = async (objectId: string): Promise<Blog> => {
  // Check static local mockup list first
  const fallback = FALLBACK_BLOGS.find((b) => b.objectId === objectId);
  if (!isConfigured) {
    if (fallback) return fallback;
    throw new Error('Blog post not found.');
  }
  try {
    // Cast findById response to Blog
    return (await Backendless.Data.of('Blog').findById(objectId)) as unknown as Blog;
  } catch {
    // If Backendless lookup fails (e.g. static ID not on DB), try the fallback data
    if (fallback) return fallback;
    throw new Error('Blog post not found.');
  }
};

/**
 * Retrieves the catalog of products/services.
 * Falls back to static mock offerings if Backendless database is unconfigured.
 */
export const fetchServices = async (): Promise<Service[]> => {
  return fetchWithFallback<Service>('Service', FALLBACK_SERVICES);
};

/**
 * Retrieves customer testimonials.
 * Falls back to static mock reviews if Backendless database is unconfigured.
 */
export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  return fetchWithFallback<Testimonial>('Testimonial', FALLBACK_TESTIMONIALS);
};

/**
 * Uploads a file to Backendless file storage.
 * @param file The File object from the browser file input.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const directory = 'blog-thumbnails';
  
  // Backendless.Files.upload returns an object with a fileURL property
  const result = await Backendless.Files.upload(file, directory, true) as { fileURL: string };
  return result.fileURL;
};
