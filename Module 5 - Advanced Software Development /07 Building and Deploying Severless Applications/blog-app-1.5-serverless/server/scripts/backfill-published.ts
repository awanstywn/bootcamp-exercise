/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: "postgresql://postgres:Jakarta48!@localhost:5434/blogapp?schema=public" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Connecting to database...');
    console.log('Backfilling publishedAt for existing PUBLISHED posts...');
    
    // Find all PUBLISHED posts where publishedAt is null
    const postsToUpdate = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: null,
      },
    });

    if (postsToUpdate.length === 0) {
      console.log('No posts require backfilling.');
      return;
    }

    // Update them in a transaction or individually
    let updatedCount = 0;
    for (const post of postsToUpdate) {
      await prisma.post.update({
        where: { id: post.id },
        data: { publishedAt: post.createdAt },
      });
      updatedCount++;
    }

    console.log(`Successfully backfilled publishedAt for ${updatedCount} posts.`);
  } catch (error) {
    console.error('Error backfilling published dates:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
