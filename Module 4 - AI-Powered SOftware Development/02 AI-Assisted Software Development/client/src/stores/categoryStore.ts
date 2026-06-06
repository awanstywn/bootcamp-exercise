/**
 * @fileoverview Zustand state management for Categories.
 * 
 * Relations:
 * - Consumes: `apiClient` for backend communication.
 * - Used by: `CategoriesPage.tsx` and `ProductsPage.tsx` (for dropdown selections).
 * 
 * Logic:
 * - Manages an array of `categories` and tracks loading/error states.
 * - Exposes CRUD actions: `fetchCategories`, `createCategory`, `updateCategory`, `deleteCategory`.
 * - Optimistically updates the local state on successful mutations to avoid unnecessary refetches.
 */
import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { CreateCategoryInput, UpdateCategoryInput } from 'shared';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryInput) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: '',

  fetchCategories: async () => {
    set({ isLoading: true, error: '' });
    try {
      const response = await apiClient.get('/categories');
      set({ categories: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch categories', isLoading: false });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await apiClient.post('/categories', data);
      set({ categories: [...get().categories, response.data], isLoading: false });
    } catch {
      set({ error: 'Failed to create category', isLoading: false });
      throw new Error('Failed to create category');
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await apiClient.put(`/categories/${id}`, data);
      set({
        categories: get().categories.map((c) => (c.id === id ? response.data : c)),
        isLoading: false,
      });
    } catch {
      set({ error: 'Failed to update category', isLoading: false });
      throw new Error('Failed to update category');
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: '' });
    try {
      await apiClient.delete(`/categories/${id}`);
      set({
        categories: get().categories.filter((c) => c.id !== id),
        isLoading: false,
      });
    } catch {
      set({ error: 'Failed to delete category', isLoading: false });
      throw new Error('Failed to delete category');
    }
  },
}));
