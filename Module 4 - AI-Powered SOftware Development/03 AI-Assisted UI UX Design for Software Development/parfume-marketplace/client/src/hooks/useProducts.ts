/**
 * @file useProducts.ts
 * @description Custom React Hook for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for useProducts operations.
 * 
 * @relations
 * Interacts with: react, ../lib/apiClient, ../lib/routes, shared.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect, useCallback } from "react";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import type { Product, PaginatedResponse } from "shared";

interface UseProductsOptions {
  category?: string;
  scentFamily?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (opts: UseProductsOptions = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const merged = { ...options, ...opts };

      if (merged.category) params.set("category", merged.category);
      if (merged.scentFamily) params.set("scentFamily", merged.scentFamily);
      if (merged.minPrice !== undefined) params.set("minPrice", String(merged.minPrice));
      if (merged.maxPrice !== undefined) params.set("maxPrice", String(merged.maxPrice));
      if (merged.sort) params.set("sort", merged.sort);
      if (merged.page) params.set("page", String(merged.page));
      if (merged.limit) params.set("limit", String(merged.limit));
      if (merged.search) params.set("search", merged.search);

      const res = await apiClient.get(`${API_ROUTES.PRODUCTS.LIST}?${params.toString()}`);
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.scentFamily, options.minPrice, options.maxPrice, options.sort, options.page, options.limit, options.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { data, isLoading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(API_ROUTES.PRODUCTS.DETAIL(slug));
        setProduct(res.data.data.product);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, isLoading, error };
}
