/**
 * @file MessageInput.tsx
 * @description The text input area for users to type and submit new messages. Handles auto-resizing, submit on enter, and disabling during active streaming.
 * @module Frontend/Components/Chat/MessageInput
 */

import { Send } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

/**
 * MessageInput
 * 
 * Renders an auto-resizing textarea for user input. Disables sending while the AI is currently streaming a response or loading.
 * Handles form submission and "Enter to submit" (without shift key).
 * 
 * @param {Props} props - Component props containing loading states and the submit handler.
 * @returns {JSX.Element} The rendered message input form.
 */
export const MessageInput = ({ onSend, disabled }: Props) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 text-gray-200
          px-4 py-2.5 text-sm placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
          disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center
          text-white hover:bg-indigo-500 active:bg-indigo-700 transition-colors
          disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
      >
        <Send size={17} />
      </button>
    </div>
  );
};
