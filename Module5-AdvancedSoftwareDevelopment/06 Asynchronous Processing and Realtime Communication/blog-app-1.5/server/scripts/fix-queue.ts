import prisma from '../src/db/prisma.js';
import { publishQueue } from '../src/config/queue.js';

async function run() {
  const posts = await prisma.post.findMany({
    where: { status: 'SCHEDULED' }
  });
  
  for (const post of posts) {
    if (post.scheduledAt) {
      const delay = Math.max(0, post.scheduledAt.getTime() - Date.now());
      console.log(`Re-queueing ${post.title} (delay: ${delay}ms)`);
      // The BullMQ Queue instance expects the job name 'publish-article' (or any name, we use 'publish-article' or 'publish')
      await publishQueue.add('publish-article', { postId: post.id }, { delay, jobId: `publish-${post.id}` });
    }
  }
  
  await prisma.$disconnect();
  console.log('Done!');
  process.exit(0);
}
run();
