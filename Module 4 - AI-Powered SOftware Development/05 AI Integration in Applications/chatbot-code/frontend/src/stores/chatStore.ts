/**
 * @file chatStore.ts
 * @description Global state management for the chat application using Zustand. Handles conversation history, active selection, and orchestrates the async API calls and Server-Sent Events (SSE) streaming for new messages.
 * @module Frontend/Store/Chat
 */

import { create } from "zustand";
import api from "../services/api";
import type { Conversation, Message } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isFetchingConversations: boolean;
  isStreaming: boolean;
  streamingContent: string;

  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createConversation: () => Promise<Conversation>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  clearCurrentConversation: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isFetchingConversations: false,
  isStreaming: false,
  streamingContent: "",

  fetchConversations: async () => {
    set({ isFetchingConversations: true });
    try {
      const res = await api.get("/conversations");
      set({ conversations: res.data.data });
    } finally {
      set({ isFetchingConversations: false });
    }
  },

  selectConversation: async (id) => {
    set({ isLoading: true });
    const res = await api.get(`/conversations/${id}`);
    const conv: Conversation = res.data.data;
    set({
      currentConversation: conv,
      messages: conv.messages || [],
      isLoading: false,
    });
  },

  createConversation: async () => {
    const res = await api.post("/conversations", {});
    const created: Conversation = res.data.data;
    set((state) => ({
      conversations: [created, ...state.conversations],
      currentConversation: created,
      messages: [],
    }));
    return created;
  },

  sendMessage: async (content) => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    // Optimistic update — show user message immediately
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation.id,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingContent: "",
    }));

    try {
      const response = await fetch(
        `${API_BASE}/chat/conversations/${currentConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line || !line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.error) {
              const errorMsg: Message = {
                id: `error-${Date.now()}`,
                conversationId: currentConversation.id,
                role: "assistant",
                content: `⚠️ ${parsed.error}`,
                createdAt: new Date().toISOString(),
              };
              set((state) => ({
                messages: [...state.messages, errorMsg],
                isStreaming: false,
                streamingContent: "",
              }));
              return;
            }

            if (parsed.done) {
              const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                conversationId: currentConversation.id,
                role: "assistant",
                content: fullContent,
                createdAt: new Date().toISOString(),
              };
              set((state) => ({
                messages: [...state.messages, aiMsg],
                isStreaming: false,
                streamingContent: "",
              }));
              get().fetchConversations();
            } else if (parsed.content) {
              fullContent += parsed.content;
              set({ streamingContent: fullContent });
            }
          } catch (e) {
            console.debug("[SSE] Invalid JSON chunk, skipping...", e);
          }
        }
      }
    } catch (error) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        conversationId: currentConversation.id,
        role: "assistant",
        content: `⚠️ Failed to send message: ${error instanceof Error ? error.message : "Connection lost"}`,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isStreaming: false,
        streamingContent: "",
      }));
    }
  },

  deleteConversation: async (id) => {
    await api.delete(`/conversations/${id}`);
    const { currentConversation } = get();
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversation: currentConversation?.id === id ? null : currentConversation,
      messages: currentConversation?.id === id ? [] : state.messages,
    }));
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null, messages: [], streamingContent: "" });
  },
}));
