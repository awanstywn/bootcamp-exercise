# Parfume Marketplace - Shared (Types & Schemas)

This workspace contains shared TypeScript definitions and Zod validation schemas that form the foundational contract between the `client` and `server` layers.

## 🛠 Tech Stack
- **TypeScript**: For static typing across the monorepo.
- **Zod**: For defining runtime validation schemas that are automatically inferred into TypeScript types.

## 📁 Directory Structure
- `/src/schemas`: Contains Zod objects validating everything from Authentication payloads to Order creation objects.
- `/src/types`: Exported TypeScript types, typically derived from the Zod schemas using `z.infer`.
- `/src/constants`: (Optional) Shared constants such as default error messages, static URLs, or ENUM mappings.

## 🚀 Usage

Since this is an internal monorepo package (often linked via npm workspaces), any changes made here will be immediately available to the client and server.

If your TypeScript setup does not rely on path aliases, ensure this package is built:
```bash
npm run build
```

## 📖 Code Documentation Standards
All schemas and type files in this workspace include comprehensive JSDoc headers specifying:
- **Objective**: What domain model the file represents.
- **Relationships**: Which endpoints or frontend forms consume the schema.
- **How it Works**: Details regarding specific validation constraints (e.g., regex patterns, required lengths).
