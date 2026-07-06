/**
 * @file conversation.ts
 * @description Controller for handling CRUD operations on chat conversations. Interacts with the in-memory data store.
 * @module Backend/Controllers/Conversation
 */

import { Request, Response } from "express";
import { conversations, generateId } from "../store";

/**
 * getConversations
 *
 * Retrieves all conversations from the store, sorted by the most recently updated.
 * Strips the detailed message history from the payload to reduce bandwidth, returning only metadata (like title and message count) for the sidebar list.
 *
 * @param {Request} _req - Express Request object (unused).
 * @param {Response} res - Express Response object used to send the JSON array of conversations.
 */
// GET /api/conversations — get all conversations
export const getConversations = (_req: Request, res: Response) => {
  // Return without messages (metadata only)
  const data = conversations
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(({ messages, ...rest }) => ({
      ...rest,
      _count: { messages: messages.length },
    }));

  res.json({ success: true, data });
};

/**
 * getConversationById
 *
 * Retrieves a single conversation by its ID, including its full message history.
 * Used when a user selects a specific chat from the sidebar to display the chat history in the main window.
 *
 * @param {Request} req - Express Request object containing the conversation ID in params.
 * @param {Response} res - Express Response object used to send the conversation JSON or a 404 error.
 * @returns {Response | void}
 */
// GET /api/conversations/:id — get one conversation with messages
export const getConversationById = (req: Request, res: Response) => {
  const conv = conversations.find((c) => c.id === req.params.id);

  if (!conv) {
    return res.status(404).json({ success: false, error: "Conversation not found" });
  }

  res.json({ success: true, data: conv });
};

/**
 * createConversation
 *
 * Initializes a new, empty conversation in the store with a generated ID and current timestamps.
 * Optionally accepts a title from the request body.
 *
 * @param {Request} req - Express Request object containing an optional title in the body.
 * @param {Response} res - Express Response object used to return the newly created conversation JSON.
 */
// POST /api/conversations — create new conversation
export const createConversation = (req: Request, res: Response) => {
  const { title } = req.body;

  const conv = {
    id: generateId(),
    title: title || "New Conversation",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  conversations.push(conv);
  res.status(201).json({ success: true, data: conv });
};

/**
 * deleteConversation
 *
 * Removes a conversation and all of its associated messages from the in-memory store based on the provided ID.
 *
 * @param {Request} req - Express Request object containing the conversation ID in params.
 * @param {Response} res - Express Response object used to confirm deletion or return a 404 error.
 * @returns {Response | void}
 */
// DELETE /api/conversations/:id
export const deleteConversation = (req: Request, res: Response) => {
  const idx = conversations.findIndex((c) => c.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Conversation not found" });
  }

  conversations.splice(idx, 1);
  res.json({ success: true, message: "Conversation deleted successfully" });
};
