import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    slug: "bleu-de-chanel-edp-100ml",
    category: "MEN" as const,
    scentFamily: "WOODY" as const,
    notesTop: "Citrus, Mint, Pink Pepper",
    notesHeart: "Ginger, Nutmeg, Jasmine, Iso E Super",
    notesBase: "Sandalwood, Cedar, Vetiver, Labdanum",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(2350000),
    volumeMl: 100,
    stock: 25,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Bleu+de+Chanel&font=playfair-display",
    description: "A captivating and remarkably versatile woody aromatic fragrance for men. Bleu de Chanel EDP opens with an invigorating burst of citrus and mint before settling into a warm heart of jasmine and ginger. The dry down of sandalwood and cedar creates a magnetic trail.",
  },
  {
    name: "Sauvage",
    brand: "Dior",
    slug: "dior-sauvage-edt-100ml",
    category: "MEN" as const,
    scentFamily: "AROMATIC" as const,
    notesTop: "Calabrian Bergamot, Pepper",
    notesHeart: "Sichuan Pepper, Lavender, Star Anise, Nutmeg",
    notesBase: "Ambroxan, Cedar, Labdanum",
    concentration: "EDT" as const,
    price: new Prisma.Decimal(1950000),
    volumeMl: 100,
    stock: 30,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Dior+Sauvage&font=playfair-display",
    description: "Raw and noble all at once, Sauvage is a fragrance that distills the essence of wide-open spaces. Ruggedly fresh, Sauvage is an act of creation inspired by wild landscapes.",
  },
  {
    name: "Oud Wood",
    brand: "Tom Ford",
    slug: "tom-ford-oud-wood-edp-50ml",
    category: "UNISEX" as const,
    scentFamily: "ORIENTAL" as const,
    notesTop: "Oud Wood, Rosewood, Cardamom",
    notesHeart: "Sandalwood, Vetiver, Chinese Pepper",
    notesBase: "Tonka Bean, Amber",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(4200000),
    volumeMl: 50,
    stock: 12,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Oud+Wood&font=playfair-display",
    description: "Exotic, smoky, and exquisitely rare — Oud Wood is a precious commodity in the world of fragrance. Tom Ford has composed this wood to create an unmistakable aura of sophistication and warmth.",
  },
  {
    name: "N°5",
    brand: "Chanel",
    slug: "chanel-no5-edp-100ml",
    category: "WOMEN" as const,
    scentFamily: "FLORAL" as const,
    notesTop: "Neroli, Ylang-Ylang, Aldehydes",
    notesHeart: "Jasmine, Rose, Lily of the Valley",
    notesBase: "Sandalwood, Vanilla, Vetiver, Musk",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(2650000),
    volumeMl: 100,
    stock: 20,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Chanel+N°5&font=playfair-display",
    description: "An iconic feminine fragrance that is both timeless and modern. Chanel N°5 embodies understated luxury with its bouquet of abstract florals layered over warm, powdery base notes.",
  },
  {
    name: "Flowerbomb",
    brand: "Viktor & Rolf",
    slug: "viktor-rolf-flowerbomb-edp-100ml",
    category: "WOMEN" as const,
    scentFamily: "FLORAL" as const,
    notesTop: "Bergamot, Tea, Freesia",
    notesHeart: "Jasmine, Rose, Orchid, Centifolia Rose",
    notesBase: "Patchouli, Musk, Vanilla",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(2450000),
    volumeMl: 100,
    stock: 18,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Flowerbomb&font=playfair-display",
    description: "A floral explosion that is an extraordinarily sensory experience. An addictive bouquet of cattleya, centifolia roses, sambac jasmine, and osmanthus — finished with a rich base of patchouli and vanilla.",
  },
  {
    name: "Miss Dior",
    brand: "Dior",
    slug: "miss-dior-edp-100ml",
    category: "WOMEN" as const,
    scentFamily: "FLORAL" as const,
    notesTop: "Lily of the Valley, Peony",
    notesHeart: "Rose, Jasmine, Iris",
    notesBase: "Musk, Rosewood, Vanilla",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(2150000),
    volumeMl: 100,
    stock: 22,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Miss+Dior&font=playfair-display",
    description: "A couture fragrance inspired by the boldness and femininity of Christian Dior's vision. Fresh, floral, and subtly sensual, Miss Dior celebrates the art of the garden with an intoxicating bouquet.",
  },
  {
    name: "Santal 33",
    brand: "Le Labo",
    slug: "le-labo-santal-33-edp-50ml",
    category: "UNISEX" as const,
    scentFamily: "WOODY" as const,
    notesTop: "Cardamom, Iris, Violet",
    notesHeart: "Ambrox, Australian Sandalwood",
    notesBase: "Cedarwood, Leather, Musk",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(4650000),
    volumeMl: 50,
    stock: 8,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Santal+33&font=playfair-display",
    description: "Inspired by the intoxicating warmth of the American West, Santal 33 is an addictive, unisex scent that melds creamy sandalwood with smoky, leathery accords.",
  },
  {
    name: "Acqua di Gio Profumo",
    brand: "Giorgio Armani",
    slug: "armani-acqua-di-gio-profumo-edp-75ml",
    category: "MEN" as const,
    scentFamily: "AQUATIC" as const,
    notesTop: "Bergamot, Sea Notes, Aquatic Accord",
    notesHeart: "Geranium, Rosemary, Sage",
    notesBase: "Patchouli, Amber, Incense",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(1800000),
    volumeMl: 75,
    stock: 35,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Acqua+di+Gio&font=playfair-display",
    description: "A sophisticated evolution of the original Acqua di Gio. This intense and sensual fragrance combines freshness with a woody, ambery character for a refined masculine signature.",
  },
  {
    name: "Light Blue",
    brand: "Dolce & Gabbana",
    slug: "dolce-gabbana-light-blue-edt-100ml",
    category: "WOMEN" as const,
    scentFamily: "FRESH" as const,
    notesTop: "Sicilian Lemon, Apple, Cedarwood",
    notesHeart: "Jasmine, Bamboo, White Rose",
    notesBase: "Cedar, Amber, Musk",
    concentration: "EDT" as const,
    price: new Prisma.Decimal(1400000),
    volumeMl: 100,
    stock: 40,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Light+Blue&font=playfair-display",
    description: "A sparkling, fresh fragrance that captures the spirit of a Mediterranean summer. Light Blue is the scent of sunny days and carefree moments by the sea.",
  },
  {
    name: "Aventus",
    brand: "Creed",
    slug: "creed-aventus-edp-100ml",
    category: "MEN" as const,
    scentFamily: "FRESH" as const,
    notesTop: "Pineapple, Bergamot, Apple, Black Currant",
    notesHeart: "Birch, Jasmine, Patchouli, Rose",
    notesBase: "Musk, Oakmoss, Ambergris, Vanilla",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(5800000),
    volumeMl: 100,
    stock: 6,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Aventus&font=playfair-display",
    description: "Inspired by the dramatic life of a historic emperor, Aventus celebrates strength, power, and success. A unique blend of pineapple, birch, and musk creates an unforgettable statement fragrance.",
  },
  {
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    slug: "mfk-baccarat-rouge-540-edp-70ml",
    category: "UNISEX" as const,
    scentFamily: "ORIENTAL" as const,
    notesTop: "Saffron, Jasmine",
    notesHeart: "Amberwood, Cedar",
    notesBase: "Fir Resin, Ambergris",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(5250000),
    volumeMl: 70,
    stock: 5,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Baccarat+Rouge&font=playfair-display",
    description: "A luminous and sophisticated fragrance that mixes the warmth of amberwood and the brightness of saffron. Baccarat Rouge 540 leaves a poetic, mineral-amber trail that is instantly recognizable.",
  },
  {
    name: "La Vie Est Belle",
    brand: "Lancôme",
    slug: "lancome-la-vie-est-belle-edp-75ml",
    category: "WOMEN" as const,
    scentFamily: "GOURMAND" as const,
    notesTop: "Black Currant, Pear",
    notesHeart: "Iris, Jasmine, Orange Blossom",
    notesBase: "Praline, Vanilla, Patchouli, Tonka Bean",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(1650000),
    volumeMl: 75,
    stock: 28,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=La+Vie+Est+Belle&font=playfair-display",
    description: "A declaration of happiness — La Vie Est Belle is a sweet, warm iris gourmand fragrance. The first-ever iris gourmand, it combines the elegance of iris with the indulgence of praline and vanilla.",
  },
  {
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    slug: "ysl-black-opium-edp-90ml",
    category: "WOMEN" as const,
    scentFamily: "ORIENTAL" as const,
    notesTop: "Pink Pepper, Orange Blossom, Pear",
    notesHeart: "Coffee, Jasmine, Bitter Almond, Licorice",
    notesBase: "Vanilla, Patchouli, Cedar, Cashmere Wood",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(2000000),
    volumeMl: 90,
    stock: 25,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Black+Opium&font=playfair-display",
    description: "A rock'n'roll interpretation of a classic Oriental fragrance. The energizing coffee accord meets the seduction of vanilla for a scent that is both rebellious and glamorous.",
  },
  {
    name: "Neroli Portofino",
    brand: "Tom Ford",
    slug: "tom-ford-neroli-portofino-edp-50ml",
    category: "UNISEX" as const,
    scentFamily: "CITRUS" as const,
    notesTop: "Bergamot, Mandarin Orange, Lemon, Lavender",
    notesHeart: "African Orange Flower, Neroli, Jasmine",
    notesBase: "Amber, Angelica, Musk, Ambrette",
    concentration: "EDP" as const,
    price: new Prisma.Decimal(3700000),
    volumeMl: 50,
    stock: 10,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Neroli+Portofino&font=playfair-display",
    description: "Capturing the glamour of the Italian Riviera, Neroli Portofino is vibrant, energizing, and utterly sophisticated. Sparkling citrus and floral notes evoke a sun-drenched Mediterranean escape.",
  },
  {
    name: "Terre d'Hermès",
    brand: "Hermès",
    slug: "hermes-terre-dhermes-edt-100ml",
    category: "MEN" as const,
    scentFamily: "WOODY" as const,
    notesTop: "Orange, Grapefruit, Flint",
    notesHeart: "Pelargonium, Pepper, Benzoin",
    notesBase: "Cedar, Vetiver, Mineral Accord",
    concentration: "EDT" as const,
    price: new Prisma.Decimal(1550000),
    volumeMl: 100,
    stock: 20,
    status: "ACTIVE" as const,
    imageUrl: "https://placehold.co/800x1000/F5F0E8/111827?text=Terre+d'Hermès&font=playfair-display",
    description: "A metaphor for the earth's raw materials — orange and flint, pepper and cedar, benzoin and vetiver. Terre d'Hermès draws a diagonal between sky and earth, matter and spirit.",
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Seed products with images
  for (const product of products) {
    const result = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
      },
      create: product,
    });

    // Create a ProductImage for each product from its imageUrl
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: result.id },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: result.id,
          url: result.imageUrl,
          altText: `${result.brand} ${result.name}`,
          sortOrder: 0,
        },
      });
    }

    console.log(`  ✓ ${result.brand} — ${result.name} (${result.slug})`);
  }

  // Create test customer user
  const customerHash = await bcrypt.hash("password123", 10);
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });
  console.log(`\n  ✓ Test customer: ${testUser.email} (password: password123)`);

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@parfume.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@parfume.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin user: ${adminUser.email} (password: admin123)`);

  // Seed site settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      bankName: "ABC",
      bankAccountName: "test",
      bankAccountNo: "1234567890",
      whatsappNumber: "628888888888",
    },
  });
  console.log(`  ✓ Site settings seeded (Bank: ABC, WA: 628888888888)`);

  const dummyContent = `
<h1>Lorem Ipsum</h1>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  `;

  // Seed content pages
  const pages = [
    { slug: "about-us", title: "About Us", content: dummyContent },
    { slug: "shipping", title: "Shipping Info", content: dummyContent },
    { slug: "returns", title: "Returns", content: dummyContent },
  ];

  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`  ✓ Content pages seeded (About Us, Shipping Info, Returns)`);

  console.log(`\n✅ Seeding completed! ${products.length} products + 2 users + settings + ${pages.length} pages`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
