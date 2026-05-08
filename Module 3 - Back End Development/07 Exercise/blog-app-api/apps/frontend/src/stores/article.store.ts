// src/stores/article.store.ts
// Zustand store for article state — handles all CRUD operations and loading states.
//
// Design decisions:
//   - fetchArticles() populates the `articles` array used by both HomePage (all published)
//     and DashboardPage (filtered by current user's authorId on the frontend side).
//   - Each mutation (create/update/delete) returns a boolean so the calling component
//     can decide whether to close a modal or refresh the list.
//   - Toast notifications are fired inside store actions for consistent UX.
//   - `currentArticle` is a separate slot used by ArticleDetailPage; cleared on unmount.

import { create } from 'zustand';
import type { Article, CreateArticleInput, UpdateArticleInput } from '@blog-app/shared';
import { articleApi } from '@/api/article.api';
import toast from 'react-hot-toast';

interface ArticleState {
  articles: Article[];
  currentArticle: Article | null;
  isLoading: boolean;
  fetchArticles: (search?: string, searchBy?: string) => Promise<void>;
  fetchArticle: (id: string) => Promise<void>;
  createArticle: (data: CreateArticleInput) => Promise<boolean>;
  updateArticle: (id: string, data: UpdateArticleInput) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  clearCurrent: () => void;
}

export const useArticleStore = create<ArticleState>((set) => ({
  articles: [],
  currentArticle: null,
  isLoading: false,

  fetchArticles: async (search?: string, searchBy?: string) => {
    set({ isLoading: true });
    try {
      const res = await articleApi.getAll(search, searchBy);
      set({ articles: res.data.articles, isLoading: false });
    } catch (error) {
      set({ articles: [], isLoading: false });
    }
  },

  fetchArticle: async (id) => {
    set({ isLoading: true, currentArticle: null });
    try {
      const res = await articleApi.getById(id);
      set({ currentArticle: res.data.article });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Article not found';
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  createArticle: async (data) => {
    try {
      await articleApi.create(data);
      toast.success('Article published!');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create article';
      toast.error(msg);
      return false;
    }
  },

  updateArticle: async (id, data) => {
    try {
      await articleApi.update(id, data);
      toast.success('Article updated!');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update article';
      toast.error(msg);
      return false;
    }
  },

  deleteArticle: async (id) => {
    try {
      await articleApi.delete(id);
      toast.success('Article deleted!');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete article';
      toast.error(msg);
      return false;
    }
  },

  clearCurrent: () => set({ currentArticle: null }),
}));
