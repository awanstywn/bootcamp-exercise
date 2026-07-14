/**
 * @file chat.ts
 * @description Controller for handling chat-related API endpoints. Manages the integration with the OpenRouter AI service and streams responses back to the client via Server-Sent Events (SSE).
 * @module Backend/Controllers/Chat
 */

import { Request, Response } from "express";
import { OpenRouterService } from "../services/openrouter";
import { conversations, generateId } from "../store";
import { ChatMessage } from "../types";

// Lazy init — created on first use (after dotenv is loaded)
let openRouter: OpenRouterService | null = null;
const getOpenRouter = () => {
  if (!openRouter) openRouter = new OpenRouterService();
  return openRouter;
};

// Default model — use free model from OpenRouter
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "google/gemma-4-26b-a4b-it:free";

// Simple system prompt
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  "You are a helpful AI assistant. Answer clearly, concisely, and in the same language as the user.";

/**
 * sendMessage
 *
 * Processes an incoming user message, appends it to the conversation history, and communicates with the LLM via OpenRouter.
 * It streams the AI's response token-by-token back to the frontend using Server-Sent Events (SSE) to create a real-time typing effect.
 * Automatically generates a conversation title based on the first user message.
 *
 * @param {Request} req - Express Request object containing the conversation ID in params and user message in body.
 * @param {Response} res - Express Response object used to stream the SSE data.
 * @returns {Promise<void | Response>} - Resolves when streaming is complete or returns an error response early.
 */
// POST /api/chat/conversations/:conversationId/messages
export const sendMessage = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const { content } = req.body;

  // Validate input
  if (!content?.trim()) {
    return res.status(400).json({ success: false, error: "Message cannot be empty" });
  }

  // Find conversation in memory
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ success: false, error: "Conversation not found" });
  }

  // Save user message to memory
  conversation.messages.push({
    id: generateId(),
    conversationId,
    role: "user",
    content,
    createdAt: new Date(),
  });

  // Build message history for API (take last 20 messages)
  const recentMessages = conversation.messages.slice(-20);
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Setup SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");

  let fullResponse = "";

  try {
    await getOpenRouter().chatStream(
      messages,
      DEFAULT_MODEL,
      // onChunk: on each new token
      (chunk) => {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      // onDone: streaming finished
      () => {
        // Save AI response to memory
        conversation.messages.push({
          id: generateId(),
          conversationId,
          role: "assistant",
          content: fullResponse,
          createdAt: new Date(),
        });

        // Update conversation title from first user message
        if (conversation.messages.filter((m) => m.role === "user").length === 1) {
          const rawTitle = content.trim();
          conversation.title =
            rawTitle.length > 10
              ? rawTitle.slice(0, 50) + (rawTitle.length > 50 ? "..." : "")
              : "Chat " + new Date().toLocaleDateString("id-ID");
        }

        conversation.updatedAt = new Date();

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    );
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number }; message?: string };
    console.error(
      "[Chat] OpenRouter streaming error:",
      axiosError?.response?.status,
      axiosError?.message
    );

    let errorMessage = "AI service unavailable. Please try again later.";

    if (axiosError?.response?.status === 429) {
      errorMessage =
        "Rate limit reached (Too Many Requests). Please wait a few seconds and try again.";
    } else if (axiosError?.response?.status === 401) {
      errorMessage = "Invalid API Key or API Key not set.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);
    res.end();
  }
};
