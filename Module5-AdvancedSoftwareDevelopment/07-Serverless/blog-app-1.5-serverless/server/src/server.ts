/**
 * @fileoverview Server Entry Point
 * @objective Start the Express HTTP server and listen for incoming connections on the configured port.
 * @risk Running the server on an occupied port throws an error (EADDRINUSE).
 * @relations Bootstraps the application defined in `app.ts` using configurations from `env.ts`.
 * @logic
 * - Imports the fully configured Express `app`.
 * - Calls `app.listen()` on `env.PORT`.
 * - Conditionally sets up Socket.io and BullMQ worker events.
 * - Logs confirmation to the console.
 */
import app from './app.js';
import { env } from './config/env.js';
import prisma from './db/prisma.js';
import { logger } from './config/logger.js';
import { redisClient } from './config/redis.js';
import { createServer } from 'http';
import { initSocketIO } from './config/socket.js';
import { publishWorker } from './config/queue.js';
import { Request, Response } from 'express';

async function startServer() {
  try {
    // 1. Ensure DB is connected before taking requests
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // Cleanup expired tokens in background
    prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] }
    }).then((res: { count: number }) => logger.info(`Cleaned up ${res.count} expired/revoked tokens.`)).catch((err: Error) => logger.error('Cleanup tokens error', err));

    const httpServer = createServer(app);
    const io = initSocketIO(httpServer);

    // Wire BullMQ → Socket.io (only if BullMQ worker is available)
    if (publishWorker) {
      publishWorker.on('completed', (_job, result) => {
        logger.info(`[Server] Emitting article:published to clients for post: ${result.title}`);
        const payload = {
          id: result.id,
          title: result.title,
          slug: result.slug,
          author: result.author,
        };
        logger.info(`[Server] Emitting payload: ${JSON.stringify(payload)}`);
        io.emit('article:published', payload);
      });
    } else {
      logger.warn('[Server] BullMQ worker not available. Real-time publish events disabled.');
    }

    // 2. Capture the server instance
    const server = httpServer.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    app.get('/api/test-socket', (req: Request, res: Response) => {
      const payload = {
        id: 'test-id',
        title: 'Manually Triggered Post',
        slug: 'manually-triggered-post',
        author: { name: 'Test Author' }
      };
      logger.info(`[Server] Emitting manually triggered payload: ${JSON.stringify(payload)}`);
      io.emit('article:published', payload);
      res.send('Event emitted');
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
        if (publishWorker) {
          await publishWorker.close();
          logger.info('Closed BullMQ worker.');
        }
        if (redisClient) {
          await redisClient.quit();
          logger.info('Disconnected from Redis.');
        }
        logger.info('Exiting now.');
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

// Only start the HTTP server if we are not on Vercel
if (!process.env.VERCEL) {
  startServer();
}
