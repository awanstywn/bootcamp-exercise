/**
 * @file product.types.ts
 * @description Type Definition for the Shared layer.
 * 
 * @objective 
 * To provide the specific functionality required for product.types operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  slug: string;
  category: "MEN" | "WOMEN" | "UNISEX";
  scentFamily: "FLORAL" | "WOODY" | "FRESH" | "ORIENTAL" | "CITRUS" | "AQUATIC" | "GOURMAND" | "AROMATIC";
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  concentration: "EDT" | "EDP" | "PARFUM" | "EDC";
  price: number;
  volumeMl: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  imageUrl: string;
  description: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
