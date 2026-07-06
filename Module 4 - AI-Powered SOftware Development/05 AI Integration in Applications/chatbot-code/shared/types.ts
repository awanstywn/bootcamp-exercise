/**
 * @file types.ts
 * @description Shared TypeScript interfaces used consistently across both the frontend React app and backend Express server to maintain type safety.
 * @module Shared/Types
 */

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string | Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
