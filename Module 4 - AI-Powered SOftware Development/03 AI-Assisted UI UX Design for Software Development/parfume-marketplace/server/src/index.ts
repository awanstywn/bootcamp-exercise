/**
 * @file index.ts
 * @description Utility/Module for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for index operations.
 * 
 * @relations
 * Interacts with: ./app.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API base: http://localhost:${PORT}/api`);
});
