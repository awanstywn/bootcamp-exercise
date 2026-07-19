import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../src/db/prisma.js';

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminEmail = 'admin@sembako.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: UserRole.ADMIN,
      },
    });
    console.log('✅ Admin user created (admin@sembako.com)');
  } else {
    console.log('✅ Admin user already exists');
  }

  // 2. Seed Categories
  const categories = [
    { id: 'cat_sayuran', name: 'Sayuran', slug: 'sayuran', description: 'Sayuran segar berkualitas' },
    { id: 'cat_buah', name: 'Buah', slug: 'buah', description: 'Buah-buahan segar' },
    { id: 'cat_daging', name: 'Daging', slug: 'daging', description: 'Daging sapi dan ayam potong' },
    { id: 'cat_bumbu', name: 'Bumbu Dapur', slug: 'bumbu-dapur', description: 'Bumbu masakan dan rempah' },
    { id: 'cat_sembako', name: 'Sembako', slug: 'sembako', description: 'Beras, minyak, gula, dll' },
  ];

  const categoryRecords = [];
  for (const cat of categories) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryRecords.push(createdCat);
  }
  console.log('✅ Categories seeded');

  // 3. Seed Buyer User
  const buyerEmail = 'buyer@sembako.com';
  const existingBuyer = await prisma.user.findUnique({ where: { email: buyerEmail } });

  if (!existingBuyer) {
    const hashedBuyerPassword = await bcrypt.hash('Buyer123!', 10);
    await prisma.user.create({
      data: {
        email: buyerEmail,
        password: hashedBuyerPassword,
        name: 'Test Buyer',
        role: UserRole.VISITOR,
      },
    });
    console.log('✅ Buyer user created (buyer@sembako.com)');
  } else {
    console.log('✅ Buyer user already exists');
  }

  // 4. Seed Products
  if (categoryRecords.length > 0) {
    const products = [
      { id: 'prod_kangkung', name: 'Kangkung Segar', slug: 'kangkung-segar', description: 'Ikat kangkung organik', price: 5000, stock: 100, unit: 'BUNCH', categoryId: categoryRecords[0].id, isActive: true },
      { id: 'prod_beras', name: 'Beras Premium 5kg', slug: 'beras-premium-5kg', description: 'Beras pulen pilihan', price: 75000, stock: 50, unit: 'KG', categoryId: categoryRecords[4].id, isActive: true },
      { id: 'prod_minyak', name: 'Minyak Goreng 2L', slug: 'minyak-goreng-2l', description: 'Minyak sawit jernih', price: 35000, stock: 30, unit: 'LITER', categoryId: categoryRecords[4].id, isActive: true },
      { id: 'prod_gula', name: 'Gula Pasir 1kg', slug: 'gula-pasir-1kg', description: 'Gula putih murni', price: 16000, stock: 40, unit: 'KG', categoryId: categoryRecords[4].id, isActive: true },
      { id: 'prod_ayam', name: 'Ayam Potong 1kg', slug: 'ayam-potong-1kg', description: 'Ayam negeri potong', price: 45000, stock: 20, unit: 'KG', categoryId: categoryRecords[2].id, isActive: true },
    ];

    for (const prod of products) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: prod,
      });
    }
    console.log('✅ Products seeded');
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
