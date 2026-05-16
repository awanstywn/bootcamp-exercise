import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const dummyUsers = [
  { name: 'Alice Smith', email: 'alice.smith@example.com' },
  { name: 'Bob Johnson', email: 'bob.j@example.com' },
  { name: 'Charlie Davis', email: 'charlie.d@example.com' },
  { name: 'Diana Prince', email: 'diana.p@example.com' },
  { name: 'Evan Wright', email: 'evan.w@example.com' },
  { name: 'Fiona Gallagher', email: 'fiona.g@example.com' },
  { name: 'George Miller', email: 'george.m@example.com' }
];

async function main() {
  console.log('Starting to seed...');
  for (const user of dummyUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created user with id: ${createdUser.id}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
