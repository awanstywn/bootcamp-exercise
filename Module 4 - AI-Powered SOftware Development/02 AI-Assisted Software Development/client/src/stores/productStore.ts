/**
 * @fileoverview Zustand state management for Products.
 * 
 * Relations:
 * - Consumes: `apiClient`.
 * - Used by: `ProductsPage.tsx`.
 * 
 * Logic:
 * - Stores a list of `products`. Note: In `fetchProducts`, data is extracted from `response.data.data` due to the backend's pagination structure.
 * - Provides actions to fetch, create, update, and delete products, seamlessly updating the local array on success.
 */
import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { CreateProductInput, UpdateProductInput } from 'shared';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string;
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductInput) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: '',

  fetchProducts: async () => {
    set({ isLoading: true, error: '' });
    try {
      const response = await apiClient.get('/products');
      set({ products: response.data.data, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch products', isLoading: false });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await apiClient.post('/products', data);
      set({ products: [...get().products, response.data], isLoading: false });
    } catch {
      set({ error: 'Failed to create product', isLoading: false });
      throw new Error('Failed to create product');
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await apiClient.put(`/products/${id}`, data);
      set({
        products: get().products.map((p) => (p.id === id ? response.data : p)),
        isLoading: false,
      });
    } catch {
      set({ error: 'Failed to update product', isLoading: false });
      throw new Error('Failed to update product');
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: '' });
    try {
      await apiClient.delete(`/products/${id}`);
      set({
        products: get().products.filter((p) => p.id !== id),
        isLoading: false,
      });
    } catch {
      set({ error: 'Failed to delete product', isLoading: false });
      throw new Error('Failed to delete product');
    }
  },
}));
