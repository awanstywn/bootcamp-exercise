# AI Chatbot Frontend

This is the React frontend for the AI Chatbot application. It is built for speed, responsiveness, and a modern aesthetic.

## 🏗 Architecture & Features

- **React 19 & Vite**: Utilizes the latest React features and the Vite build tool for incredibly fast Hot Module Replacement (HMR) and optimized production builds.
- **State Management (Zustand)**: Uses Zustand for a lightweight, hook-based global store. This manages active conversations, chat history, and UI loading states.
- **Styling (Tailwind CSS)**: Built with a utility-first CSS framework to ensure a consistent, dark-themed, and responsive design without the overhead of massive custom CSS files.
- **Server-Sent Events (SSE)**: The application seamlessly consumes streaming responses from the backend. The UI updates token-by-token, mimicking a live typing effect.

## 🚀 Scripts

- `npm run dev`: Starts the Vite development server. (Note: API requests starting with `/api` are automatically proxied to `localhost:3001` to avoid CORS issues during local development).
- `npm run build`: Compiles the application into static files for production deployment.
- `npm run preview`: Previews the compiled production build locally.

## 🛠 Configuration

- **TypeScript Strict Mode**: The project enforces strict type checking.
- **Verbatim Module Syntax**: Imports of TypeScript-only types must use the `import type` syntax (e.g., `import type { KeyboardEvent } from "react"`).
