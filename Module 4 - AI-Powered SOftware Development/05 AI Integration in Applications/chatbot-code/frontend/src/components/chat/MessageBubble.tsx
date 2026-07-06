import type { Message } from "../../types";
/**
 * @file MessageBubble.tsx
 * @description Renders a single message bubble (either from the user or the AI assistant), including styling and timestamp formatting.
 * @module Frontend/Components/Chat/MessageBubble
 */

import { Bot, User } from "lucide-react";

// Bubble for a single message
/**
 * MessageBubble
 * 
 * A presentational component that formats and displays a message block. It uses different styles and icons
 * depending on whether the message role is 'user' or 'assistant'.
 * 
 * @param {Props} props - The component props containing the message data.
 * @returns {JSX.Element} The rendered message bubble.
 */
export const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
          ${isUser ? "bg-indigo-600" : "bg-gray-700"}`}
      >
        {isUser ? (
          <User size={15} className="text-white" />
        ) : (
          <Bot size={15} className="text-indigo-300" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5
          ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700/50"
          }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <span className={`text-xs mt-1 block ${isUser ? "text-indigo-200/60" : "text-gray-500"}`}>
          {new Date(message.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

// Bubble shown when AI is typing (streaming)
export const StreamingBubble = ({ content }: { content: string }) => (
  <div className="flex gap-3 mb-4">
    <div className="w-8 h-8 rounded-xl bg-gray-700 flex items-center justify-center">
      <Bot size={15} className="text-indigo-300" />
    </div>
    <div className="max-w-[70%] bg-gray-800 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-gray-700/50">
      {content ? (
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
      ) : (
        <div className="flex gap-1.5 py-1">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
        </div>
      )}
    </div>
  </div>
);
