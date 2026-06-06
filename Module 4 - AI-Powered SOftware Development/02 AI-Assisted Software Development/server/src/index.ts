/**
 * @fileoverview Entry point for the Express backend server.
 * 
 * Relations:
 * - Consumes: `dotenv` and the `app` instance from `app.ts`.
 * - Used by: Node execution (`tsx watch src/index.ts`) as the main startup file.
 * 
 * Logic:
 * - Loads environment variables from the root monorepo directory.
 * - Binds the configured Express app to the specified PORT and starts listening for incoming HTTP requests.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Load env variables from root

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
