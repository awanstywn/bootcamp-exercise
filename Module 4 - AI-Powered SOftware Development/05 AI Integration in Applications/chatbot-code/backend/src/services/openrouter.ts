/**
 * @file openrouter.ts
 * @description Service class for interacting with the OpenRouter AI API. Handles authentication, headers, and parsing Server-Sent Events (SSE) data streams.
 * @module Backend/Services/OpenRouter
 */

import axios from "axios";
import { ChatMessage } from "../types";

const BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in .env!");
    }
  }

  // Standard headers required by OpenRouter
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "AI Chatbot Bootcamp",
    };
  }

  /**
   * chatStream
   *
   * Sends a chat completion request to OpenRouter and processes the response as a continuous stream of tokens.
   * It parses the incoming SSE text buffer, extracts the JSON chunks containing the AI's response tokens,
   * and triggers the `onChunk` callback for real-time delivery to the client.
   *
   * @param {ChatMessage[]} messages - Array of messages (system prompt + conversation history + new user message).
   * @param {string} model - The specific model ID to request from OpenRouter (e.g., 'google/gemma-4-26b-a4b-it:free').
   * @param {(chunk: string) => void} onChunk - Callback executed every time a new text token is extracted from the stream.
   * @param {() => void} onDone - Callback executed when the streaming is completely finished or aborted.
   * @returns {Promise<void>}
   */
  async chatStream(
    messages: ChatMessage[],
    model: string,
    onChunk: (chunk: string) => void,
    onDone: () => void
  ): Promise<void> {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      { model, messages, stream: true },
      {
        headers: this.getHeaders(),
        responseType: "stream",
      }
    );

    return new Promise((resolve, reject) => {
      let buffer = "";
      response.data.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line || !line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone();
            resolve();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {
            console.debug("[OpenRouter] Invalid JSON chunk, skipping...", e);
          }
        }
      });

      response.data.on("error", reject);
      response.data.on("end", () => {
        onDone();
        resolve();
      });
    });
  }
}
