/**
 * @fileoverview Server Entry Point
 * @objective Start the Express HTTP server and listen for incoming connections on the configured port.
 * @risk Running the server on an occupied port throws an error (EADDRINUSE).
 * @relations Bootstraps the application defined in `app.ts` using configurations from `env.ts`.
 * @logic
 * - Imports the fully configured Express `app`.
 * - Calls `app.listen()` on `env.PORT`.
 * - Logs confirmation to the console.
 */
/* eslint-disable no-console */
import app from './app.js';
import { env } from './config/env.js';
import prisma from './db/prisma.js';

async function startServer() {
  try {
    // 1. Ensure DB is connected before taking requests
    await prisma.$connect();
    console.log('Database connected successfully.');

    // 2. Capture the server instance
    const server = app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });

    // 3. Handle server-level errors (like EADDRINUSE)
    server.on('error', (error) => {
      console.error('Server encountered an error:', error);
      process.exit(1);
    });

    // 4. Implement Graceful Shutdown
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      setTimeout(() => {
        console.error('Forcefully shutting down server after 10s timeout.');
        process.exit(1);
      }, 10000).unref();

      server.close(async () => {
        console.log('Closed all incoming HTTP connections.');
        await prisma.$disconnect();
        console.log('Disconnected from database. Exiting now.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();
