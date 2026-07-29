/**
 * @fileoverview BullMQ Queue Configuration (Conditional)
 * @objective Provide a job queue for scheduled article publishing using BullMQ and Redis.
 * @risk If Redis is unavailable, BullMQ cannot function. The queue is disabled gracefully.
 * @relations Used by `content.service.ts` to schedule posts, and `server.ts` to wire completion events.
 * @logic
 * - Only initializes the queue and worker if REDIS_URL is configured.
 * - If Redis is not available, exports null values and logs a warning.
 * - Enables TLS for Upstash Redis connections (rediss:// URLs).
 */
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';
import prisma from '../db/prisma.js';
import { CacheService } from '../services/cache.service.js';

let publishQueue: Queue | null = null;
let publishWorker: Worker | null = null;

if (env.REDIS_URL) {
  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Enable TLS for Upstash Redis (rediss:// URLs)
    tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  // Create the publish queue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publishQueue = new Queue('publish-article', { connection: connection as any });

  // Create the worker that processes scheduled publishes
  publishWorker = new Worker(
    'publish-article',
    async (job) => {
      const { postId } = job.data;
      logger.info(`[Queue] Processing scheduled publish for post: ${postId}`);

      const post = await prisma.post.update({
        where: { id: postId, status: 'SCHEDULED' },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        include: {
          author: { select: { id: true, name: true } },
          category: true,
        },
      });

      // Invalidate the cache so the UI reflects the published status immediately
      await CacheService.delByPattern('posts:*');

      // Return for the completion handler
      return post;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { connection: connection as any }
  );

  publishWorker.on('completed', (job, result) => {
    logger.info(`[Queue] Post "${result.title}" published successfully`);
  });

  publishWorker.on('failed', (job, err) => {
    logger.error(`[Queue] Failed to publish post ${job?.data.postId}:`, err);
  });
} else {
  logger.warn('BullMQ disabled: REDIS_URL not configured. Scheduled publishing will not work.');
}

export { publishQueue, publishWorker };
