/**
 * IP Extraction Utility
 * 
 * This module extracts the real client IP addressing reverse proxy deployments,
 * and provides simple detection for common bot user agents.
 */

import { Request } from "express";

/**
 * Extracts the real IP address from an Express request object.
 * It's aware of common proxy setups like load balancers which append IPs to the
 * 'x-forwarded-for' header.
 * 
 * @param req The Express request object
 * @returns The extracted IP address as a string, or "unknown" if none is found
 */
export function extractIp(req: Request): string {
  // Check the 'x-forwarded-for' header, which is standard when behind proxies
  const xForwarded = req.headers["x-forwarded-for"];
  
  if (typeof xForwarded === "string") {
    // x-forwarded-for can be a comma-separated list of IPs.
    // The first one is typically the original client IP.
    return xForwarded.split(",")[0]?.trim() || "unknown";
  } else if (Array.isArray(xForwarded)) {
    // In rare cases where it's parsed as an array of strings
    return xForwarded[0]?.trim() || "unknown";
  }
  
  // Fallback to Express's built-in req.ip (works if 'trust proxy' is set or no proxy is used)
  if (req.ip) {
    return req.ip;
  }
  
  // Final fallback
  return "unknown";
}

/**
 * Checks if a user agent string belongs to a known bot or crawler.
 * Using a simple keyword matching approach.
 * 
 * @param userAgent The user-agent string to check
 * @returns True if a bot keyword is detected, otherwise false
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const botKeywords = [
    "bot", "crawler", "spider", "headless", "curl", "wget", "python"
  ];
  
  const lowerAgent = userAgent.toLowerCase();
  // Check if any keyword exists in the user agent string
  return botKeywords.some(keyword => lowerAgent.includes(keyword));
}
