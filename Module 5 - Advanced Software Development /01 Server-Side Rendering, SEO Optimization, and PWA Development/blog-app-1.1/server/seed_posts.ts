/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 3 dummy articles...');

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { email: 'admin@blog.com', name: 'Admin' } });
  }

  const cat1 = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Technology', slug: 'technology' },
  });

  const cat2 = await prisma.category.upsert({
    where: { slug: 'design' },
    update: {},
    create: { name: 'Design', slug: 'design' },
  });

  const posts = [
    {
      title: 'The Future of Web Development',
      slug: 'the-future-of-web-development-1',
      content:
        '## The Evolution of the Web\n\nWeb development is constantly changing. New frameworks and tools emerge every year, making it easier than ever to build complex applications.\n\n### What is next?\n\nThe rise of AI-assisted coding is one of the most exciting trends. Developers can now build faster and focus more on architecture rather than boilerplate code.',
      excerpt:
        'A brief look into how web development is evolving and what the future holds for developers.',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      categoryId: cat1.id,
      coverImageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072',
    },
    {
      title: 'Mastering Minimalist UI Design',
      slug: 'mastering-minimalist-ui-design-1',
      content:
        '## Less is More\n\nMinimalism is not about taking away everything. It is about removing the unnecessary so that the necessary may speak.\n\n### Key Principles\n\n- White space is your friend\n- Use a limited color palette\n- Typography matters more than ever',
      excerpt:
        'Learn the core principles of minimalist UI design and how to apply them to your next project.',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      categoryId: cat2.id,
      coverImageUrl:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=2000',
    },
    {
      title: 'Why Server-Side Rendering Matters',
      slug: 'why-server-side-rendering-matters-1',
      content:
        '## The Need for Speed\n\nClient-side rendering revolutionized how we build apps, but it came with a cost: initial load time and SEO challenges.\n\n### The SSR Comeback\n\nModern frameworks like Next.js and Remix have made Server-Side Rendering (SSR) cool again. By rendering the initial HTML on the server, we get the best of both worlds: fast initial loads and rich interactivity.',
      excerpt:
        'Explore why Server-Side Rendering (SSR) has made a huge comeback in modern web frameworks.',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      categoryId: cat1.id,
      coverImageUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070',
    },
  ];

  for (const p of posts) {
    const exists = await prisma.post.findUnique({ where: { slug: p.slug } });
    if (!exists) {
      await prisma.post.create({ data: p });
      console.log(`Created post: ${p.title}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
