/**
 * @fileoverview Database seed script to populate the initial database state.
 * 
 * Relations:
 * - Consumes: `PrismaClient` and `bcrypt`.
 * - Used by: `npm run seed` or `npx prisma db seed` script.
 * 
 * Logic:
 * - Connects to the database and ensures essential data (Admin user, default Categories, dummy Products) exists.
 * - Uses `upsert` to avoid duplicating data if the script is run multiple times.
 */
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding database...');

  // 1. Create User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword
    }
  });
  console.log(`User created: ${user.email}`);

  // 2. Create Categories
  const categoryElectronics = await prisma.category.upsert({
    where: { name_userId: { name: 'Electronics', userId: user.id } },
    update: {},
    create: { name: 'Electronics', userId: user.id }
  });
  
  const categoryClothing = await prisma.category.upsert({
    where: { name_userId: { name: 'Clothing', userId: user.id } },
    update: {},
    create: { name: 'Clothing', userId: user.id }
  });

  const categoryFood = await prisma.category.upsert({
    where: { name_userId: { name: 'Food & Beverage', userId: user.id } },
    update: {},
    create: { name: 'Food & Beverage', userId: user.id }
  });
  console.log('Categories seeded.');

  // 3. Create Products
  const productsData = [
    {
      name: 'Wireless Mouse',
      sku: 'ELEC-001',
      price: 29.99,
      stock: 150,
      categoryId: categoryElectronics.id,
      userId: user.id,
      status: 'ACTIVE' as const
    },
    {
      name: 'Mechanical Keyboard',
      sku: 'ELEC-002',
      price: 89.99,
      stock: 45,
      categoryId: categoryElectronics.id,
      userId: user.id,
      status: 'ACTIVE' as const
    },
    {
      name: 'Cotton T-Shirt',
      sku: 'CLO-001',
      price: 15.0,
      stock: 300,
      categoryId: categoryClothing.id,
      userId: user.id,
      status: 'ACTIVE' as const
    },
    {
      name: 'Winter Jacket',
      sku: 'CLO-002',
      price: 120.0,
      stock: 0,
      categoryId: categoryClothing.id,
      userId: user.id,
      status: 'EMPTY' as const
    },
    {
      name: 'Organic Coffee Beans',
      sku: 'FOOD-001',
      price: 18.5,
      stock: 100,
      categoryId: categoryFood.id,
      userId: user.id,
      status: 'ACTIVE' as const
    },
    {
      name: 'Discontinued Soda',
      sku: 'FOOD-002',
      price: 2.0,
      stock: 0,
      categoryId: categoryFood.id,
      userId: user.id,
      status: 'INACTIVE' as const
    }
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { sku_userId: { sku: p.sku, userId: user.id } },
      update: {},
      create: p
    });
  }
  console.log('Products seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
