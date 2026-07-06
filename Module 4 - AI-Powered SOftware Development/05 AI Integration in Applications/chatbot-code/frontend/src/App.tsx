/**
 * @file App.tsx
 * @description The root layout component of the AI Chatbot application.
 * @module Frontend/App
 */

import { ConversationList } from "./components/chat/ConversationList";
import { ChatWindow } from "./components/chat/ChatWindow";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * App
 * 
 * Sets up the primary responsive layout for the application, consisting of a sidebar (ConversationList) 
 * and a main content area (ChatWindow). Wrapped in an ErrorBoundary to catch and handle rendering crashes.
 * 
 * @returns {JSX.Element} The rendered application layout.
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-gray-950">
        <ConversationList />
        <ChatWindow />
      </div>
    </ErrorBoundary>
  );
}

export default App;
