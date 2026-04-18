/**
 * Data Paths Utility
 * 
 * This file centralizes the logic for resolving absolute paths to our data files.
 * Since we are using ES Modules (type: "module"), __dirname is not available directly.
 * We use import.meta.url and URL to derive the project root dynamically.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

/**
 * Gets the absolute path to the root directory of the project.
 * It resolves the directory of the current file and goes up two levels (src/utils -> src -> root).
 * 
 * @returns The absolute path to the project root.
 */
function getProjectRoot(): string {
  // Get the file path of this current module
  const __filename = fileURLToPath(import.meta.url);
  // Get the directory containing this current module (src/utils)
  const __dirname = path.dirname(__filename);
  // Go up two directories to reach the root of the project
  return path.resolve(__dirname, "../../");
}

/**
 * Gets the absolute path to the links.json database file.
 */
export function getLinksPath(): string {
  return path.join(getProjectRoot(), "data", "links.json");
}

/**
 * Gets the absolute path to the analytics.json database file.
 */
export function getAnalyticsPath(): string {
  return path.join(getProjectRoot(), "data", "analytics.json");
}

/**
 * Ensures that the data directory exists.
 * If it doesn't exist, it creates it recursively.
 * This should be called during application startup.
 */
export async function ensureDataDir(): Promise<void> {
  const dataDir = path.join(getProjectRoot(), "data");
  try {
    // Create the directory if it doesn't exist, ignore if it does
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Failed to ensure data directory exists:", error);
    // Re-throw so the app knows it cannot start properly
    throw error;
  }
}
