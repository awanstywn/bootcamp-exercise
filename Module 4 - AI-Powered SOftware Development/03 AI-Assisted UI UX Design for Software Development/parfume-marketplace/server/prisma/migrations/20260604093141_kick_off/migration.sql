-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MEN', 'WOMEN', 'UNISEX');

-- CreateEnum
CREATE TYPE "ScentFamily" AS ENUM ('FLORAL', 'WOODY', 'FRESH', 'ORIENTAL', 'CITRUS', 'AQUATIC', 'GOURMAND', 'AROMATIC');

-- CreateEnum
CREATE TYPE "Concentration" AS ENUM ('EDT', 'EDP', 'PARFUM', 'EDC');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "category" "Category" NOT NULL,
    "scentFamily" "ScentFamily" NOT NULL,
    "notesTop" TEXT NOT NULL,
    "notesHeart" TEXT NOT NULL,
    "notesBase" TEXT NOT NULL,
    "concentration" "Concentration" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
