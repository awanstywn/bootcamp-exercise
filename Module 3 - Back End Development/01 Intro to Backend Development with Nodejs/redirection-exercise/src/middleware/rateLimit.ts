/**
 * Rate Limiter Middleware
 * 
 * Provides defense against abusive traffic and Denial-of-Service attacks.
 * It restricts how broadly API consumer IPs can make requests within a given timer window.
 */

import rateLimit from "express-rate-limit";

// Applies universally across all exposed endpoints except where bounded specifically.
// Window: 15 Minutes || Limit: 200 Requests max
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true, // Draft constraint informing clients rate-limits via `RateLimit-*` headers
  legacyHeaders: false, // Disables standard unmaintained headers `X-RateLimit-*`
  message: { error: "Terlalu banyak request, coba lagi nanti" }
});

// Provides restrictive tracking exclusively attached directly over active shortened redirection traffic.
// Window: 1 Minute || Limit: 60 Requests max
export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak request, coba lagi nanti" }
});
