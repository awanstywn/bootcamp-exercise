import { PostStatus } from '@prisma/client';
import prisma from '../src/db/prisma.js';

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@blogapp.com',
      name: 'System Admin',
      bio: 'Administrator of BlogApp.',
    },
  });

  const author1 = await prisma.user.create({
    data: {
      email: 'johndoe@example.com',
      name: 'John Doe',
      bio: 'Passionate about technology, design, and sharing knowledge.',
    },
  });

  // 2. Create Categories
  const categories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'React', slug: 'react' },
    { name: 'CSS', slug: 'css' },
    { name: 'Tutorial', slug: 'tutorial' },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  const webDevCat = await prisma.category.findUnique({ where: { slug: 'web-development' } });
  const jsCat = await prisma.category.findUnique({ where: { slug: 'javascript' } });
  const reactCat = await prisma.category.findUnique({ where: { slug: 'react' } });

  // 3. Create Tags
  const tags = [
    { name: 'Frontend', slug: 'frontend' },
    { name: 'Backend', slug: 'backend' },
    { name: 'UI/UX', slug: 'ui-ux' },
    { name: 'Performance', slug: 'performance' },
  ];

  for (const t of tags) {
    await prisma.tag.create({ data: t });
  }

  const frontendTag = await prisma.tag.findUnique({ where: { slug: 'frontend' } });

  // 4. Create Posts
  const posts = [
    {
      title: 'How to Learn React in 2024',
      slug: 'how-to-learn-react-in-2024',
      content:
        'React is constantly evolving. In this guide, we will explore the best ways to master React in 2024...',
      excerpt: 'A comprehensive guide to mastering React in 2024.',
      status: PostStatus.PUBLISHED,
      authorId: author1.id,
      categoryId: reactCat?.id,
      tags: frontendTag ? { connect: [{ id: frontendTag.id }] } : undefined,
    },
    {
      title: 'Mastering JavaScript Closures',
      slug: 'mastering-javascript-closures',
      content:
        'Closures are one of the most powerful features of JavaScript. Let us break down how they work...',
      excerpt: 'Demystifying JavaScript closures with practical examples.',
      status: PostStatus.PUBLISHED,
      authorId: author1.id,
      categoryId: jsCat?.id,
      tags: frontendTag ? { connect: [{ id: frontendTag.id }] } : undefined,
    },
    {
      title: 'CSS Grid vs Flexbox: When to Use What',
      slug: 'css-grid-vs-flexbox',
      content:
        'Struggling to choose between CSS Grid and Flexbox? Here is a breakdown of their ideal use cases...',
      excerpt: 'A practical comparison between CSS Grid and Flexbox.',
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      categoryId: webDevCat?.id,
      tags: frontendTag ? { connect: [{ id: frontendTag.id }] } : undefined,
    },
    {
      title: 'Building Scalable APIs with Node.js',
      slug: 'building-scalable-apis-nodejs',
      content:
        'Node.js is great for building scalable backend APIs. Let us discuss architecture patterns...',
      excerpt: 'Architecture patterns for scalable Node.js APIs.',
      status: PostStatus.PUBLISHED,
      authorId: author1.id,
      categoryId: webDevCat?.id,
      tags: {},
    },
    {
      title: 'Understanding React Server Components',
      slug: 'understanding-react-server-components',
      content:
        'React Server Components (RSC) are changing how we build React apps. Here is what you need to know...',
      excerpt: 'A deep dive into React Server Components.',
      status: PostStatus.PUBLISHED,
      authorId: author1.id,
      categoryId: reactCat?.id,
      tags: frontendTag ? { connect: [{ id: frontendTag.id }] } : undefined,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log('Database seeded successfully!');

  // 5. Create Site Settings
  const settings = [
    { key: 'aboutHeroTitle', value: 'Empowering developers to build the future of the web.' },
    {
      key: 'aboutHeroSubtitle',
      value:
        'We are a community-driven platform dedicated to sharing high-quality, actionable insights on software engineering, design, and technology.',
    },
    {
      key: 'aboutMissionText1',
      value:
        'Technology moves fast. Too fast for any single person to keep up with alone. Our mission is to cut through the noise and provide a curated space where experienced professionals and eager learners can exchange real-world knowledge.',
    },
    {
      key: 'aboutMissionText2',
      value:
        "Whether you're debugging a complex microservices architecture or just starting your first React project, we believe that open knowledge sharing is the key to pushing the entire industry forward.",
    },
    { key: 'aboutStat1Value', value: '1M+' },
    { key: 'aboutStat1Label', value: 'Monthly Readers' },
    { key: 'aboutStat2Value', value: '500+' },
    { key: 'aboutStat2Label', value: 'Expert Contributors' },
    { key: 'aboutStat3Value', value: '10k+' },
    { key: 'aboutStat3Label', value: 'Articles Published' },
    { key: 'aboutCtaTitle', value: 'Join Our Community of Writers' },
    {
      key: 'aboutCtaText',
      value:
        'Have a story to share? A technical deep-dive? We are always looking for passionate voices to join our growing roster of authors.',
    },
  ];

  await prisma.siteSetting.deleteMany();
  for (const s of settings) {
    await prisma.siteSetting.create({ data: s });
  }

  console.log('Site Settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
