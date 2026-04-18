/**
 * Application Entry Point
 * 
 * Main bootloader wiring configurations sequentially defining behaviors scaling server instances.
 * Enforces correct runtime parameters verifying configurations before opening active listening endpoints.
 */

import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { ensureDataDir } from "./utils/dataPaths.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimit.js";
import { requestLogger } from "./middleware/logger.js";

import healthRouter from "./routes/health.js";
import analyticsRouter from "./routes/analytics.js";
import adminRouter from "./routes/admin.js";
import redirectRouter from "./routes/redirect.js";

// Load environment variables strictly before proceeding defining application configurations.
dotenv.config();

// Abort server sequences securely preventing unexpected operation running devoid administration validations.
if (!process.env.ADMIN_API_KEY) {
  console.error("ERROR: ADMIN_API_KEY belum diset di .env");
  process.exit(1);
}

export const app = express();
const port = process.env.PORT || 3000;

// Empower express instance acknowledging backend proxies explicitly (e.g. Nginx, Render, Railway).
app.set("trust proxy", true);

// ============================================
// Global Middleware Pipeline (Registration Order IS CRITICAL)
// ============================================

// 1. Setup rigorous HTTP security headers stopping diverse attacks implicitly.
app.use(helmet());

// 2. Extrapolate incoming bodies decoding JSON schemas natively attached requests.
app.use(express.json());

// 3. Implements global traffic restriction slowing broad abuse.
app.use(generalLimiter);

// 4. Attach observational listener documenting endpoint usage.
app.use(requestLogger);

// ============================================
// Route Branches (Registration Order IS CRITICAL)
// ============================================

// Static deterministic endpoints register earlier than dynamic catch-alls.
app.use("/", healthRouter);
app.use("/", analyticsRouter);
app.use("/api", adminRouter); // Placed securely above redirection handlers avoiding collision instances.

// Dynamic /:slug router rests exclusively upon bottom sequence ensuring only unidentified sequences reach redirection checks.
app.use("/", redirectRouter);

// ============================================
// Error Handler Middleware
// ============================================

// Traps any previously uncaught error traversing up from prior middleware operations.
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================

async function bootstrap() {
  try {
    // Assert active database path configurations resolving completely before accepting connections.
    await ensureDataDir();

    if (process.env.NODE_ENV !== "test") {
      app.listen(port, () => {
        console.log(`🚀 [Server] URL Shortener API is running on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Failed to bootstrap server gracefully:", error);
    process.exit(1);
  }
}

// Global runtime exceptions catching keeping instances from shutting down unnoticed.
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Launch!
bootstrap();
