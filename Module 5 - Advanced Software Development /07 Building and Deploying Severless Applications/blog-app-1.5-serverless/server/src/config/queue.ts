/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';
import prisma from '../db/prisma.js';
import { CacheService } from '../services/cache.service.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

// Create the publish queue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const publishQueue = new Queue('publish-article', { connection: connection as any });

// Create the worker that processes scheduled publishes
export const publishWorker = new Worker(
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
