/**
 * FILE: src/server.ts
 * 
 * DESCRIPTION:
 * This is the entry point of the application. It configures the Express 
 * application instance, registers all API routes, sets up global error 
 * handling, and starts the HTTP server.
 * 
 * INTERACTION:
 * - Reads environment variables (via `dotenv`).
 * - Imports the router from `src/routes/todo.routes.js` and mounts it on `/todos`.
 * - Calls `app.listen()` to start listening for incoming HTTP requests.
 */

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import todoRoutes from "./routes/todo.routes.js";

// Load environment variables from .env file
dotenv.config();

// Create the Express application instance
const app = express();

// =============================================
// Global Middleware
// =============================================

// Parse incoming JSON request bodies
app.use(express.json());

// =============================================
// Routes
// =============================================

// Register all todo routes under the /todos prefix
app.use("/todos", todoRoutes);

// =============================================
// Error Handler (must be registered last)
// =============================================

// Global error handler middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  // Log the full error to terminal for debugging
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Send a generic error response to the client
  res.status(500).json({
    error: "Internal server error",
  });
});

// =============================================
// Start Server
// =============================================

// Use PORT from .env, or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
