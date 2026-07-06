/**
 * @file ConversationList.tsx
 * @description Sidebar component that displays all past conversations, allowing users to switch between chats, create new ones, or delete them.
 * @module Frontend/Components/Chat/ConversationList
 */

import { MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";

/**
 * ConversationList
 * 
 * Connects to `chatStore` to fetch and render the list of available conversations. Includes a loading skeleton during the initial fetch.
 * 
 * @returns {JSX.Element} The rendered sidebar containing the chat list.
 */
export const ConversationList = () => {
  const {
    conversations,
    currentConversation,
    isFetchingConversations,
    fetchConversations,
    selectConversation,
    createConversation,
    deleteConversation,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewChat = async () => {
    await createConversation();
  };

  return (
    <div className="w-72 bg-gray-900 flex flex-col h-full flex-shrink-0 border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-indigo-400" />
          <h1 className="text-white font-semibold text-base tracking-tight">AI Chatbot</h1>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
            bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700
            transition-colors text-sm font-medium shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Label */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">History</p>
      </div>

      {/* List conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isFetchingConversations ? (
          <div className="space-y-1.5 mt-2 px-2">
            <div className="h-9 w-full bg-gray-800/60 rounded-xl animate-pulse"></div>
            <div className="h-9 w-full bg-gray-800/60 rounded-xl animate-pulse delay-75"></div>
            <div className="h-9 w-full bg-gray-800/60 rounded-xl animate-pulse delay-150"></div>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-gray-600 text-center mt-4">No chats yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => selectConversation(conv.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectConversation(conv.id);
                }
              }}
              className={`group w-full flex items-center text-left gap-2 px-3 py-2.5 rounded-xl cursor-pointer mb-0.5
                text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                ${
                  currentConversation?.id === conv.id
                    ? "bg-gray-700/80 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                }`}
            >
              <MessageSquare size={14} className="flex-shrink-0 opacity-60" />
              <span className="flex-1 truncate text-xs">{conv.title}</span>
              <button
                type="button"
                aria-label="Delete conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this conversation?")) deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500
                  hover:text-red-400 transition-all p-0.5 focus:opacity-100 focus:outline-none"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
