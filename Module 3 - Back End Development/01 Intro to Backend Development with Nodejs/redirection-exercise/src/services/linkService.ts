/**
 * Link Service
 * 
 * This module encapsulates all business logic related to managing the shortened links.
 * It acts as the intermediary between the persistent file store and the route handlers.
 */

import { LinkEntry, LinksStore, HttpError } from "../types/index.js";
import { getLinksPath } from "../utils/dataPaths.js";
import { readJson, writeJson } from "../utils/fileStore.js";
import { isValidSlug, sanitizeUrl } from "../utils/sanitize.js";

/**
 * Fetches all links from the persistent storage.
 * 
 * @returns A promise resolving to the entire LinksStore object.
 */
export async function getAllLinks(): Promise<LinksStore> {
  const filePath = getLinksPath();
  // Return an empty object {} if the file doesn't exist yet
  return await readJson<LinksStore>(filePath, {});
}

/**
 * Resolves a slug to its target URL entry.
 * 
 * @param slug The short identifier mapping to a URL
 * @returns The LinkEntry if found, otherwise null
 */
export async function resolveLink(slug: string): Promise<LinkEntry | null> {
  const store = await getAllLinks();
  const entry = store[slug];
  return entry ? entry : null;
}

/**
 * Creates a new shortened link entry.
 * Validates the input data to ensure integrity and security.
 * 
 * @param slug The unique short identifier
 * @param url The target destination URL
 * @param description Optional metadata describing the link
 * @throws HttpError if the slug or URL are invalid, or if the slug already exists
 */
export async function createLink(slug: string, url: string, description?: string): Promise<void> {
  // Validate slug format
  if (!isValidSlug(slug)) {
    throw new HttpError(400, "Invalid slug format — only letters, numbers, hyphens, and underscores are allowed (max 50 chars).");
  }

  // Validate URL protocol and format
  const safeUrl = sanitizeUrl(url);

  const store = await getAllLinks();

  // Check for uniqueness
  if (store[slug]) {
    throw new HttpError(409, "Slug is already in use.");
  }

  // Construct the new entry
  const newEntry: LinkEntry = {
    url: safeUrl,
    createdAt: new Date().toISOString()
  };
  if (description) {
    newEntry.description = description;
  }

  // Add to map and persist
  store[slug] = newEntry;
  await writeJson(getLinksPath(), store);
}

/**
 * Updates an existing shortened link's target URL.
 * 
 * @param slug The slug identifier to update
 * @param newUrl The new target destination URL
 * @throws HttpError if the slug does not exist or URL is invalid
 */
export async function updateLink(slug: string, newUrl: string): Promise<void> {
  const safeUrl = sanitizeUrl(newUrl);
  const store = await getAllLinks();

  if (!store[slug]) {
    throw new HttpError(404, "Slug not found.");
  }

  // Only update the url to preserve the original createdAt time and description
  store[slug].url = safeUrl;
  await writeJson(getLinksPath(), store);
}

/**
 * Deletes a shortened link entry cleanly from the store.
 * 
 * @param slug The slug identifier to remove
 * @throws HttpError if the slug does not exist
 */
export async function deleteLink(slug: string): Promise<void> {
  const store = await getAllLinks();

  if (!store[slug]) {
    throw new HttpError(404, "Slug not found.");
  }

  // Remove the property from the object completely
  delete store[slug];
  await writeJson(getLinksPath(), store);
}
