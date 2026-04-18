/**
 * Geo Service
 * 
 * Resolves IP addresses to geographical locations (countries).
 * Uses the geoip-lite library which relies on local MaxMind databases.
 */

import geoip from "geoip-lite";

/**
 * Retrieves the country code for a given IP address.
 * It handles local loopback and private network IPs specifically.
 * 
 * @param ip The IP address string
 * @returns 2-letter ISO country code, 'Local', 'Private', or 'Unknown'
 */
export function getCountry(ip: string): string {
  // Check loopback IP addresses (localhost)
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "Local";
  }
  
  // Basic regex to match common private network IPv4 ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  const isPrivateRange = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.)/.test(ip);
  if (isPrivateRange) {
    return "Private";
  }

  try {
    // Lookup the IP in the geoip database
    const result = geoip.lookup(ip);
    if (result && result.country) {
      return result.country;
    }
  } catch (error) {
    // If the library fails internally, fallback to Unknown
    console.error(`GeoIP lookup failed for IP ${ip}:`, error);
  }

  return "Unknown";
}
