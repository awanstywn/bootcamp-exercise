# Antigravity Shared Workspace

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/tech-TypeScript%20|%20Zod-blue.svg)

## Elevator Pitch
The Antigravity Shared layer acts as the single source of truth for data structures across the monorepo. By defining Zod schemas here, we eliminate code duplication, ensure that both the frontend forms and backend API endpoints enforce identical validation rules, and establish end-to-end type safety.

## Visuals Placeholder
![App Screenshot](../docs/shared-schema.png)

## Tech Stack
- TypeScript
- Zod (Schema Validation)

## Prerequisites
- Node.js
- npm or pnpm

## Installation & Local Setup
1. Navigate to the shared directory:
   ```bash
   cd shared
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the package (if required by the monorepo manager):
   ```bash
   npm run build
   ```

## Usage
The shared library is imported directly by both the `client` and `server` packages.
Example:
```typescript
import { CreateProductSchema, type CreateProductInput } from 'shared';
```

## Monorepo Architecture
The `shared` package sits at the core of the monorepo. It is a dependency for both the `client` (used for client-side form validation) and the `server` (used for Express request validation middlewares). This ensures structural consistency across network boundaries.

## License
MIT License
