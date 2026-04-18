/**
 * Analytics Service
 * 
 * This module handles all interactions involving visitor tracking and analytics data generation.
 * It's responsible for capturing individual visits and crunching the data into summaries.
 */

import { Request } from "express";
import { VisitRecord, AnalyticsResponse, AnalyticsSummary } from "../types/index.js";
import { getAnalyticsPath } from "../utils/dataPaths.js";
import { readJson, writeJson } from "../utils/fileStore.js";
import { extractIp, isBot } from "../utils/ipExtract.js";
import { getCountry } from "./geoService.js";

// Maximum log capacity. If size exceeds this, older records are deleted
const MAX_RECORDS = 10000;

/**
 * Helper to fetch all analytics records from storage.
 */
async function getRawAnalytics(): Promise<VisitRecord[]> {
  return await readJson<VisitRecord[]>(getAnalyticsPath(), []);
}

/**
 * Analyzes an incoming Express request and records the visit metrics.
 * 
 * @param slug The visited URL slug identifier
 * @param req The Express request object triggered by the visit
 */
export async function recordVisit(slug: string, req: Request): Promise<void> {
  const ip = extractIp(req);
  const country = getCountry(ip);
  const referrer = req.headers.referer || "direct";
  const userAgent = req.headers["user-agent"] || "unknown";
  
  // Construct the visit structure
  const visit: VisitRecord = {
    slug,
    timestamp: new Date().toISOString(),
    ip,
    country,
    referrer,
    userAgent,
    isBot: isBot(userAgent)
  };

  const records = await getRawAnalytics();
  
  // Add new visit record
  records.push(visit);

  // Maintain max array size to prevent boundless storage growth
  if (records.length > MAX_RECORDS) {
    // Slices from the rear, taking only the most recent MAX_RECORDS
    const excess = records.length - MAX_RECORDS;
    records.splice(0, excess);
  }

  // Persist seamlessly
  await writeJson(getAnalyticsPath(), records);
}

/**
 * Compiles and aggregates the raw visit records into an organized statistical overview.
 * 
 * @returns AnalyticsResponse object encompassing generated metrics per slug.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsResponse> {
  const records = await getRawAnalytics();
  const slugGroups: Record<string, VisitRecord[]> = {};

  // Group visits under their target slug
  for (const record of records) {
    if (!slugGroups[record.slug]) {
      slugGroups[record.slug] = [];
    }
    slugGroups[record.slug]!.push(record);
  }

  const summaries: AnalyticsSummary[] = [];
  let totalVisitsAllTime = 0;

  // Process grouped records
  for (const [slug, visits] of Object.entries(slugGroups)) {
    const totalVisits = visits.length;
    totalVisitsAllTime += totalVisits;

    const uniqueIpSet = new Set<string>();
    const countriesCount: Record<string, number> = {};

    for (const v of visits) {
      uniqueIpSet.add(v.ip);
      // Initialize or increment country hit map
      countriesCount[v.country] = (countriesCount[v.country] || 0) + 1;
    }

    // Since visits are chronologically appended, the last item is the most recent
    const lastVisited = visits.length > 0 ? visits[visits.length - 1]!.timestamp : null;
    
    // Reverse array to obtain the 10 most recent chronological instances
    const recentVisits = [...visits].reverse().slice(0, 10);

    summaries.push({
      slug,
      totalVisits,
      uniqueIps: uniqueIpSet.size,
      countries: countriesCount,
      lastVisited,
      recentVisits
    });
  }

  // Sort summaries so the most visited slugs appear first
  summaries.sort((a, b) => b.totalVisits - a.totalVisits);

  return {
    generatedAt: new Date().toISOString(),
    totalVisitsAllTime,
    summaries
  };
}

/**
 * Completely erases all tracking data resetting the store to an empty array.
 */
export async function clearAnalytics(): Promise<void> {
  await writeJson(getAnalyticsPath(), []);
}

/**
 * Optional routine useful for fetching raw events linked strictly to one slug.
 * 
 * @param slug The relevant slug
 * @returns Array filled exclusively with records bound to the given slug.
 */
export async function getVisitsForSlug(slug: string): Promise<VisitRecord[]> {
  const records = await getRawAnalytics();
  return records.filter(record => record.slug === slug);
}
