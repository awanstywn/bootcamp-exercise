/**
 * @fileoverview Standardized API response formatters.
 * @objective To ensure consistent JSON response structures across all API endpoints for both success and error scenarios.
 * @logic
 * 1. Defines an `ApiResponse` interface to standardize the response payload structure.
 * 2. `sendSuccess`: Formats and sends a successful HTTP response, including the HTTP status code, data payload, and a timestamp.
 * 3. `sendError`: Formats and sends an error HTTP response, including the HTTP status code, error message, and a timestamp.
 */
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  } as ApiResponse<T>);
};

export const sendError = (res: Response, error: string, statusCode: number = 500): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
};
