# Shared Types & Contracts

This workspace contains pure TypeScript types, interfaces, and enums shared across the Fullstack Blog Application.

## Overview

The `shared` layer bridges the frontend (`client/`) and backend (`server/`). By defining strict API contracts and shared data models here, we guarantee that both ends of the application stay perfectly in sync.

## Architecture & Principles

- **No Implementation Logic:** This workspace contains _zero_ executable code. It is exclusively for TypeScript declarations.
- **No Dependencies:** It does not depend on React, Express, Prisma, or any framework-specific libraries.

## Relationship to Monorepo

- **The Contract:** The frontend uses these types to understand what the backend API returns, and the backend uses these types to validate outgoing payloads.
- **Manual Syncing Required:** If the `server` introduces a database change (e.g., updating a Prisma Schema or Enum), the developer must manually update the corresponding types in `shared/src/types.ts` so the `client` is made aware of the structural change.
