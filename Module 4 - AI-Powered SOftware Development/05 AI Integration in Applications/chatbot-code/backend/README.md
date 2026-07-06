# AI Chatbot Backend

This is the Node.js and Express backend for the AI Chatbot application. It serves as an API gateway between the React frontend and the OpenRouter AI models.

## 🏗 Architecture & Features

- **Express.js API**: Handles routing and controller logic.
- **OpenRouter Integration**: Connects to OpenRouter to utilize Large Language Models (defaults to Google's Gemma model).
- **Server-Sent Events (SSE)**: Implements streaming. Instead of waiting for the entire LLM response to generate, the backend streams text chunks directly to the frontend as they arrive, significantly reducing perceived latency.
- **In-Memory Store**: Uses an in-memory data store for conversations and messages. (Note: Data is reset upon server restart).

## 🔌 API Endpoints

- `GET /api/chat/conversations` - Retrieve all conversations.
- `POST /api/chat/conversations` - Create a new conversation.
- `DELETE /api/chat/conversations/:id` - Delete a specific conversation.
- `GET /api/chat/conversations/:id/messages` - Retrieve messages for a conversation.
- `POST /api/chat/conversations/:id/messages` - Send a message and initiate an SSE stream response.

## ⚙️ Environment Variables

Create a `.env` file in this `/backend` directory before running:

| Variable             | Description                           | Required | Default                 |
| :------------------- | :------------------------------------ | :------- | :---------------------- |
| `OPENROUTER_API_KEY` | Your OpenRouter API Key.              | **Yes**  | `null`                  |
| `PORT`               | The port the Express server binds to. | No       | `3001`                  |
| `FRONTEND_URL`       | Allowed origin for CORS requests.     | No       | `http://localhost:5173` |

## 🚀 Running the Backend

This directory relies on `tsx` to run TypeScript directly without a manual compilation step.

```bash
# Start the server in watch mode
npm run dev
```
