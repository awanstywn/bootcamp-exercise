# Blog Application - Shared Library

This is the shared Data Transfer Object (DTO) and type definition layer of the Fullstack Blog Application. It acts as the strict API contract between the frontend (React) and the backend (Express).

## 🚀 Tech Stack

- **Core:** TypeScript

## 📁 Folder Structure

```text
shared/
├── src/
│   └── types.ts   # Core DTOs, Enums, and Interfaces
├── package.json   # Workspace configuration ("main" strictly points to "src/types.ts")
└── tsconfig.json  # TypeScript compilation settings
```

## 🛠️ The DTO Pattern

In this monorepo, we enforce a strict **Contract-First Design**:
1. The backend NEVER exposes raw database models (e.g. `@prisma/client` types) to the frontend.
2. The frontend NEVER defines local interfaces to match API responses.
3. BOTH the frontend and backend must import and rely exclusively on the types defined in this `shared` package.

If a database column is added or an Enum changes in the backend, a developer **must** manually update the corresponding type in this package to ensure the changes are explicitly propagated. This acts as a circuit breaker to ensure developers are aware of API contract changes.
