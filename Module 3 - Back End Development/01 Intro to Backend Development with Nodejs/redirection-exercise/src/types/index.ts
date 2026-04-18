/**
 * Type Definitions
 * 
 * This file contains all the TypeScript interfaces and types used across the application.
 * Centralizing types ensures consistency and makes it easier to manage data structures.
 */

// Represents a single shortened link entry stored in links.json
export interface LinkEntry {
  url: string;              // The original target URL
  createdAt: string;        // ISO 8601 timestamp of when the link was created
  description?: string;     // Optional description for the link
}

// Represents the structure of the links.json file: a dictionary of slugs mapped to their entries
export type LinksStore = Record<string, LinkEntry>;

// Represents a single visit record for analytics tracking
export interface VisitRecord {
  slug: string;             // The slug that was visited
  timestamp: string;        // ISO 8601 timestamp of the visit
  ip: string;               // IP address of the visitor
  country: string;          // 2-letter ISO country code or 'Unknown'/'Local'/'Private'
  referrer: string;         // Referrer URL or 'direct'
  userAgent: string;        // User-Agent string from the request header
  isBot: boolean;           // True if the user agent is detected as a bot
}

// Represents the summary of analytics for a single shortened link
export interface AnalyticsSummary {
  slug: string;                           // The slug being summarized
  totalVisits: number;                    // Total number of visits recorded
  uniqueIps: number;                      // Count of unique IP addresses
  countries: Record<string, number>;      // Frequency map of visits per country
  lastVisited: string | null;             // Timestamp of the most recent visit
  recentVisits: VisitRecord[];            // Array of the 10 most recent visit records
}

// Represents the full response for the analytics API endpoint
export interface AnalyticsResponse {
  generatedAt: string;                    // ISO 8601 timestamp of when this report was generated
  totalVisitsAllTime: number;             // Sum of all visits across all slugs
  summaries: AnalyticsSummary[];          // Array of summaries sorted by total visits descending
}

// Custom error class to represent HTTP errors with status codes
// This allows the error handler middleware to send appropriate HTTP responses
export class HttpError extends Error {
  constructor(
    public statusCode: number,            // The HTTP status code (e.g., 400, 404, 500)
    message: string                       // The error message to send to the client
  ) {
    super(message);
    this.name = "HttpError";
  }
}
