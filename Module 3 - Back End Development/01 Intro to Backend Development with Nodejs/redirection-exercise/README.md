# URL Shortener & Analytics API

A robust, production-ready URL Shortener and Analytics API built natively using Node.js, Express, and strict TypeScript. This backend engine offers reliable slug redirection, geographic analytics tracking via IP addresses, API-Key-secured administration interfaces, rate limiting mechanisms, and atomic file-based storage.

## Features

- **Blazing Fast Redirection**: Resolve arbitrary slugs to full destination URLs mapping seamlessly.
- **Analytics Tracking**: Passively collects insights including total visits, unique client IPs, requested timestamps, and geographic country approximations parsed instantly.
- **Security Utilities**: Built securely implementing headers (Helmet), rigorous validations eliminating XSS, rate-limiting limiters deterring automated DoS attacks, and API Key administration bounds.
- **Resilient File Storage**: Implements filesystem mapping securely relying heavily on `.tmp` atomic overwriting mechanisms protecting data persistence during unexpected exits.

## Requirements

- **Node.js** v20.0+
- Package managers (`npm` / `yarn` / `pnpm`)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configuration**
   Copy the provided `.env.example` file assigning valid properties matching your environments:
   ```bash
   cp .env.example .env
   ```

3. **Development Cycle**
   Starts instances actively listening relying upon `tsx` automatic reloaders:
   ```bash
   npm run dev
   ```

4. **Production Build**
   Compiles strictly validated sequences resulting into optimal ESModules distributions:
   ```bash
   npm run build
   npm start
   ```

## Endpoints Summary

### Public
- `GET /health` : Verify active status responding uniformly mapping server heartbeats.
- `GET /:slug` : Navigate natively directly crossing targets seamlessly.
- `GET /analytics` : Visually parses recorded metrics assembling comprehensive structural HTML dashboard grids.
- `GET /analytics.json` : Extracts identical metric properties distributing JSON structurally compatible.

### Administration (Requires `x-api-key` header)
- `GET /api/links` : Query mapped configurations currently existing.
- `POST /api/links` : Register new custom short-links passing `{"slug", "url", "description"}` bodies.
- `PATCH /api/links/:slug` : Switch active redirection target parameters natively preserving analytic persistence.
- `DELETE /api/links/:slug` : Completely remove active slug mappings returning responses cleanly.
- `DELETE /api/analytics` : Discard entirely any gathered statistics securely clearing states.

