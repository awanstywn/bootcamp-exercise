# AI Chatbot Monorepo 🤖

[![Built with React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Built with Express](https://img.shields.io/badge/Express-5-lightgrey.svg)](https://expressjs.com/)
[![Styled with TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

A modern, full-stack AI Chatbot application designed for real-time interactions with Large Language Models (LLMs). This project leverages **React** for a responsive user interface and **Express** to handle Server-Sent Events (SSE) via the OpenRouter API.

## 🎯 Features

- **Real-Time Streaming**: Watch the AI type out its response in real time via Server-Sent Events (SSE).
- **Modern UI**: A sleek, dark-themed interface built with TailwindCSS.
- **State Management**: Lightweight and predictable state handling using Zustand.
- **Resiliency**: Graceful failure handling with a global React Error Boundary.
- **Monorepo Architecture**: Clean separation of concerns between the frontend and backend layers, with centralized linting, formatting, and shared types.

## 🏗 Project Structure

This repository is structured as a monorepo, divided into two primary layers:

- [`/frontend`](./frontend/README.md): The React/Vite client application.
- [`/backend`](./backend/README.md): The Express.js server and API gateway.
- `/shared`: Shared TypeScript types (`Message`, `Conversation`) to enforce a strict contract between the frontend and backend.

_Note: Global formatting and linting rules are defined at the root to ensure consistency across both layers._

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- An active [OpenRouter API Key](https://openrouter.ai/)

### Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <your-repository-url>
   cd chatbot-code
   ```

2. **Install all dependencies** (for root, frontend, and backend):

   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   DEFAULT_MODEL="google/gemma-4-26b-a4b-it:free"
   SYSTEM_PROMPT="You are a helpful AI assistant. Answer clearly, concisely, and in the same language as the user."
   ```

### Running Locally

To start both the frontend and backend servers concurrently, run from the root directory:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## 🛠 Code Quality

This project uses ESLint and Prettier configured at the root level to maintain code quality.

- **Check for linting errors**:
  ```bash
  npm run lint
  ```
- **Format all code**:
  ```bash
  npm run format
  ```
