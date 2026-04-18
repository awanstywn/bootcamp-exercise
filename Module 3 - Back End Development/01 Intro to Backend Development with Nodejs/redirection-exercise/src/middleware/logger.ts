/**
 * Logger Middleware
 * 
 * Intercepts incoming requests and logs execution details including paths, status codes,
 * and duration onto the terminal console. Uses colors based on the status code to 
 * make it visually parseable.
 */

import { Request, Response, NextFunction } from "express";
import { extractIp } from "../utils/ipExtract.js";

// ANSI escape codes to print colored output in terminal
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

/**
 * Express middleware function for logging HTTP requests.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Capture start time to measure duration
  const start = Date.now();
  const ip = extractIp(req);

  // Hook into the 'finish' event to log after response headers/bodies are successfully pushed
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Determine color coding representing HTTP feedback context
    let color = colors.green; // 2xx/1xx Success Info
    if (status >= 300 && status < 400) {
      color = colors.yellow; // 3xx Redirects
    } else if (status >= 400) {
      color = colors.red; // 4xx/5xx Client & Server Errors
    }

    const timestamp = new Date().toISOString();
    
    // Log formatted string directly. Example: [2024-04-18T10:30...] GET /linkedin - 302 - 12ms - IP: 1.2.3.4
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${color}${status}${colors.reset} - ${duration}ms - IP: ${ip}`);
  });

  // Release control to subsequent middlewares or route handlers
  next();
}
