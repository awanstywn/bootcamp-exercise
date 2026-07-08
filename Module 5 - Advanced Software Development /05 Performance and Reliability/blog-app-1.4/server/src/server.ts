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
import app from './app.js';
import { env } from './config/env.js';
import prisma from './db/prisma.js';
import { logger } from './config/logger.js';
import { redisClient } from './config/redis.js';

async function startServer() {
  try {
    // 1. Ensure DB is connected before taking requests
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // Cleanup expired tokens in background
    prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] }
    }).then(res => logger.info(`Cleaned up ${res.count} expired/revoked tokens.`)).catch(err => logger.error('Cleanup tokens error', err));

    // 2. Capture the server instance
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
        logger.info('Disconnected from database.');
        await redisClient.quit();
        logger.info('Disconnected from Redis. Exiting now.');
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
