/**
 * File Store Utility
 * 
 * This module provides generic, type-safe functions for reading and writing JSON files.
 * It implements atomic writes to prevent data corruption during server crashes.
 */

import fs from "node:fs/promises";
import { HttpError } from "../types/index.js";

/**
 * Reads a JSON file and parses it into type T.
 * If the file doesn't exist (ENOENT), it gracefully returns the provided defaultValue.
 * 
 * @param filePath The absolute path to the file
 * @param defaultValue The value to return if the file does not exist
 * @returns A promise that resolves to the parsed JSON data of type T
 */
export async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error: any) {
    // If the file does not exist, return the default value (e.g., initializing a new DB)
    if (error.code === "ENOENT") {
      return defaultValue;
    }
    // For other errors (like JSON parsing errors or permission issues), throw an HTTP 500 error
    throw new HttpError(500, `Failed to read data from ${filePath}`);
  }
}

/**
 * Writes data to a JSON file atomically.
 * Atomic writing means we first write the data to a temporary file,
 * and then rename the temporary file to the target file name.
 * This ensures that if the process crashes mid-write, the target file is not left corrupted.
 * 
 * @param filePath The absolute path to the file
 * @param data The data object to be serialized and written
 */
export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  try {
    const tmpPath = `${filePath}.tmp`;
    // Serialize data with 2-space indentation for readability
    const jsonData = JSON.stringify(data, null, 2);
    
    // Write to a temporary file first
    await fs.writeFile(tmpPath, jsonData, "utf-8");
    
    // Atomically rename the temporary file to replace the actual file
    await fs.rename(tmpPath, filePath);
  } catch (error) {
    throw new HttpError(500, `Failed to save data to ${filePath}`);
  }
}
