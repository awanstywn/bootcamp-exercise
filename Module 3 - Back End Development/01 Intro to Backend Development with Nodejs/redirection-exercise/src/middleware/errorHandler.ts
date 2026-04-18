/**
 * Error Handler Middleware
 * 
 * Master sink capturing all untamed occurrences throughout express instances keeping applications robust. 
 * Consistently returns formatted structural reports maintaining stability.
 */

import { Request, Response, NextFunction } from "express";
import { HttpError } from "../types/index.js";

/**
 * Global fallback handler interpreting error classes. 
 * Since errors exist, express defines these uniquely demanding exactly four arguments `(err, req, res, next)`.
 */
export function errorHandler(
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  
  if (err instanceof HttpError) {
    // If we recognize precisely the known HttpError origin
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode
    });
    return;
  }

  // Handle generic, untamed server crashes or internal unexpected faults.
  console.error("Unhandled Error encountered:", err);

  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  
  res.status(statusCode).json({
    error: isProduction ? "Internal server error" : err.message || "Internal server error",
    statusCode,
    // Add descriptive trace sequences explicitly for development cycles 
    ...( !isProduction && { stack: err.stack } )
  });
}
