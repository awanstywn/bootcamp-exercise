/**
 * @file app.ts
 * @description Utility/Module for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for app operations.
 * 
 * @relations
 * Interacts with: express, cors, path, ./routes, ./middlewares/errorHandler.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
