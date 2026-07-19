/**
 * @fileoverview server.ts
 * @module server.ts
 * @description Handles logic for server.ts
 */
import app from './app.js';
import { env } from './config/env.js';
import prisma from './db/prisma.js';
import { logger } from './config/logger.js';

async function startServer() {
  try {
    // 1. Ensure DB is connected before taking requests
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // 2. Start the server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    // 3. Handle server-level errors (like EADDRINUSE)
    server.on('error', (error) => {
      logger.error('Server encountered an error:', error);
      process.exit(1);
    });

    // 4. Implement Graceful Shutdown
    const shutdown = async () => {
      logger.info('Shutting down server gracefully...');
      setTimeout(() => {
        logger.error('Forcefully shutting down server after 10s timeout.');
        process.exit(1);
      }, 10000).unref();

      server.close(async () => {
        logger.info('Closed all incoming HTTP connections.');
        await prisma.$disconnect();
        logger.info('Disconnected from database. Exiting now.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();
