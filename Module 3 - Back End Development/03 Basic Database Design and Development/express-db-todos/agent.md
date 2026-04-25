# Agent Configuration & Context

This file serves as documentation context for AI agents interacting with this repository.

## Technology Stack
- **Framework**: Node.js + Express
- **Language**: TypeScript (using raw ESM module system via `nodenext`)
- **Database**: PostgreSQL (hosted on Supabase)
- **Database Driver**: `pg` (node-postgres)
- **Environment**: Managed via `dotenv`

## Key Implementation Details
1. **Supabase Connection**: The database pool defined in `src/config/db.ts` requires the `ssl: { rejectUnauthorized: false }` configuration flag since it connects to a remote Supabase pooler host.
2. **ESM vs CommonJS**: The project is configured with `"type": "module"` in `package.json`. All local imports within `.ts` files MUST use the `.js` extension (e.g., `import todoRoutes from "./routes/todo.routes.js";`). This is required by Node's ESM resolution algorithm when running compiled TS.
3. **Error Handling**: The application uses an inline global error handler at the end of `src/server.ts`. Route handlers must catch errors inside `try/catch` and forward them by calling `next(error)`. The error handler must have exactly 4 parameters `(err, req, res, next)` to be recognized as error middleware by Express.
4. **Minimalist Structure**: The project intentionally merges controllers into routes and Express app configuration into the server entry point to keep the codebase concise for bootcamp purposes.
5. **Execution**: 
   - Development uses `tsx` via `npm run dev`.
   - Build step uses `tsc` via `npm run build`.

## File Responsibilities Map
- `src/server.ts`: The main entry point. It sets up the Express application, registers middleware and routes, contains the inline error handler, and starts the HTTP server.
- `src/routes/*.ts`: Defines endpoint URL paths, HTTP verbs, and contains the core operational logic (DB validation, query generation, JSON responses).
- `src/config/*.ts`: Setup global services (e.g., database connection pools).
