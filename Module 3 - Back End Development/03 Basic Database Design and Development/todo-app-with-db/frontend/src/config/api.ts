/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: config/api.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Centralized configuration for the Backend API connection.
 *   Provides the base URL used by all network requests.
 *
 * RELATIONS:
 *   - lib/axios.ts → Imports API_BASE_URL to initialize the Axios client.
 *   - .env         → Source of the VITE_API_BASE_URL environment variable.
 *
 * HOW IT WORKS:
 *   1. Environment Read: Uses 'import.meta.env' (Vite's built-in env reader).
 *   2. Fallback: If VITE_API_BASE_URL is not defined in .env, it defaults to 
 *      'http://localhost:4000' for local development.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
