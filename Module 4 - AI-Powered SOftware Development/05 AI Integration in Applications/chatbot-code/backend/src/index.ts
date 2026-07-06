/**
 * @file index.ts
 * @description Entry point for the Express backend server. Sets up middleware, routing, and global error handling for the AI Chatbot API.
 * @module Backend/Server
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

// Load .env
dotenv.config();

import conversationRoutes from "./routes/conversation";
import chatRoutes from "./routes/chat";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Global Error]:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Backend running at: http://localhost:${PORT}`);
  console.log(`🔑 OpenRouter Key: ${process.env.OPENROUTER_API_KEY ? "✅ Set" : "❌ MISSING!"}`);
  console.log(`💾 Storage: In-memory (resets on restart)`);
});

export default app;
