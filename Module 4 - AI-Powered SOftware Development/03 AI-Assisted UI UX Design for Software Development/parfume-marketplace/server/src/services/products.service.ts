/**
 * @file products.service.ts
 * @description Business Logic Service for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for products.service operations.
 * 
 * @relations
 * Interacts with: ../lib/prisma, shared, @prisma/client, ../lib/upload.
 * 
 * @howItWorks
 * Interacts directly with the database (e.g., Prisma) or external APIs to execute core application rules. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import prisma from "../lib/prisma";
import type { ProductQueryInput, ProductCreateInput } from "shared";
import { Prisma } from "@prisma/client";
import { getImageUrl, deleteImageFile } from "../lib/upload";

function generateSlug(name: string, concentration: string, volumeMl: number): string {
  return `${name}-${concentration}-${volumeMl}ml`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function serializeProduct(p: any) {
  return {
    ...p,
    price: Number(p.price),
    images: p.images || [],
  };
}

export async function listProducts(query: ProductQueryInput) {
  const { category, scentFamily, minPrice, maxPrice, sort, page, limit, search } = query;

  // Build where clause — always filter to ACTIVE products only
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (category) where.category = category as any;
  if (scentFamily) where.scentFamily = scentFamily as any;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) (where.price as any).gte = minPrice;
    if (maxPrice !== undefined) (where.price as any).lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "priceAsc":
      orderBy = { price: "asc" };
      break;
    case "priceDesc":
      orderBy = { price: "desc" };
      break;
    case "latest":
      orderBy = { createdAt: "desc" };
      break;
    case "popular":
      orderBy = { stock: "desc" };
      break;
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listAllProducts(query: ProductQueryInput) {
  // Admin version — includes all statuses
  const { sort, page, limit, search } = query;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "priceAsc") orderBy = { price: "asc" };
  if (sort === "priceDesc") orderBy = { price: "desc" };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProduct),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return serializeProduct(product);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return serializeProduct(product);
}

export async function createProduct(data: ProductCreateInput, files?: Express.Multer.File[]) {
  const slug = generateSlug(data.name, data.concentration, data.volumeMl);

  // Check slug uniqueness
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    const error: any = new Error("A product with a similar name/volume already exists");
    error.statusCode = 409;
    throw error;
  }

  const imageUrl = files && files.length > 0
    ? getImageUrl(files[0].filename)
    : data.imageUrl || "";

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      price: new Prisma.Decimal(data.price),
      imageUrl,
      images: files && files.length > 0
        ? {
            create: files.map((file, index) => ({
              url: getImageUrl(file.filename),
              altText: `${data.name} image ${index + 1}`,
              sortOrder: index,
            })),
          }
        : undefined,
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return serializeProduct(product);
}

export async function updateProduct(id: string, data: Partial<ProductCreateInput>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData: any = { ...data };
  if (data.price !== undefined) {
    updateData.price = new Prisma.Decimal(data.price);
  }

  // If name or concentration or volumeMl changed, regenerate slug
  if (data.name || data.concentration || data.volumeMl) {
    updateData.slug = generateSlug(
      data.name || product.name,
      data.concentration || product.concentration,
      data.volumeMl || product.volumeMl
    );
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return serializeProduct(updated);
}

export async function updateStock(id: string, stock: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { stock },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return serializeProduct(updated);
}

export async function addProductImages(productId: string, files: Express.Multer.File[]) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) {
    const error: any = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const maxSortOrder = product.images.length > 0
    ? Math.max(...product.images.map((img) => img.sortOrder))
    : -1;

  const newImages = await Promise.all(
    files.map((file, index) =>
      prisma.productImage.create({
        data: {
          productId,
          url: getImageUrl(file.filename),
          altText: `${product.name} image ${maxSortOrder + index + 2}`,
          sortOrder: maxSortOrder + index + 1,
        },
      })
    )
  );

  // Update main imageUrl if this is the first image
  if (product.images.length === 0 && newImages.length > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { imageUrl: newImages[0].url },
    });
  }

  return newImages;
}

export async function deleteProductImage(imageId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) {
    const error: any = new Error("Image not found");
    error.statusCode = 404;
    throw error;
  }

  // Delete file from disk
  deleteImageFile(image.url);

  // Delete from DB
  await prisma.productImage.delete({ where: { id: imageId } });

  return { message: "Image deleted" };
}

export async function deleteProduct(id: string) {
  // First check if the product has any order items
  const orderItemsCount = await prisma.orderItem.count({
    where: { productId: id }
  });

  if (orderItemsCount > 0) {
    const error: any = new Error("Cannot delete product that has been ordered. Please set status to INACTIVE instead.");
    error.statusCode = 400;
    throw error;
  }

  // Delete all image files from disk
  const productImages = await prisma.productImage.findMany({
    where: { productId: id }
  });
  
  for (const img of productImages) {
    try {
      deleteImageFile(img.url);
    } catch (e) {
      console.error("Failed to delete image file:", img.url);
    }
  }

  // Then delete the product (ProductImage will cascade delete in DB)
  await prisma.product.delete({
    where: { id }
  });

  return { message: "Product deleted successfully" };
}
