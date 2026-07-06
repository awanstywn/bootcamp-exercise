/**
 * @file store.ts
 * @description In-memory data store for the application. Maintains conversation history across requests without requiring an external database.
 * @module Backend/Store
 */

// In-memory data store — all data will be lost when server restarts
// Sufficient for bootcamp exercise, no database needed

import type { Conversation, Message } from "../../shared/types";

// Store all conversations in memory
export const conversations: Conversation[] = [];

// Helper: generate simple unique ID
let counter = 0;

/**
 * generateId
 * 
 * Generates a simple, unique identifier using the current timestamp and an incrementing counter.
 * Used for assigning IDs to new Conversations and Messages before saving them in memory.
 * 
 * @returns {string} - A unique string identifier.
 */
export const generateId = (): string => {
  counter++;
  return `${Date.now()}-${counter}`;
};
