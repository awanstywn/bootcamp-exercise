/**
 * @file ChatWindow.tsx
 * @description The main chat interface displaying the conversation history of the currently selected chat and the input area for new messages.
 * @module Frontend/Components/Chat/ChatWindow
 */

import { useEffect, useRef } from "react";
import { useChatStore } from "../../stores/chatStore";
import { MessageBubble, StreamingBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { MessageSquareDashed, Sparkles } from "lucide-react";

/**
 * ChatWindow
 * 
 * Subscribes to the `chatStore` to render the active conversation's messages using `MessageBubble` components.
 * It also automatically scrolls to the bottom when new messages arrive or are being streamed.
 * 
 * @returns {JSX.Element} The rendered chat window or an empty state if no conversation is active.
 */
export const ChatWindow = () => {
  const { messages, currentConversation, isStreaming, streamingContent, isLoading, sendMessage } =
    useChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on every new message or token
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-gray-500">
        <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mb-5">
          <MessageSquareDashed size={28} className="text-gray-600" />
        </div>
        <p className="text-lg font-medium text-gray-400">No conversation yet</p>
        <p className="text-sm mt-1.5 text-gray-600">Click "New Chat" to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-950">
      {/* Conversation header */}
      <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center gap-3 backdrop-blur-sm">
        <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center">
          <Sparkles size={16} className="text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-200 truncate max-w-xs">
            {currentConversation.title}
          </p>
          <p className="text-xs text-gray-500">Gemma 4 26B · Streaming</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {isLoading ? (
          <div className="flex justify-center py-8 text-gray-500 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-600 mt-12 text-sm">
            Start a conversation! Type a message below. 👇
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        {/* AI streaming bubble */}
        {isStreaming && <StreamingBubble content={streamingContent} />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
};
