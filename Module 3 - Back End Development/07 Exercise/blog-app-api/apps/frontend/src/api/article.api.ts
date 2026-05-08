// src/api/article.api.ts
// Article CRUD API endpoints — maps to backend routes at /api/articles.
// Response shapes (e.g., { articles: Article[] }) match the backend controller output exactly.
// Optional search params are passed as query strings for server-side filtering.

import apiClient from './client';
import type { Article, CreateArticleInput, UpdateArticleInput } from '@blog-app/shared';

export const articleApi = {
  getAll: (search?: string, searchBy?: string) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (searchBy) params.searchBy = searchBy;
    return apiClient.get<{ articles: Article[] }>('/articles', { params });
  },

  getById: (id: string) =>
    apiClient.get<{ article: Article }>(`/articles/${id}`),

  create: (data: CreateArticleInput) =>
    apiClient.post<{ message: string; article: Article }>('/articles', data),

  update: (id: string, data: UpdateArticleInput) =>
    apiClient.put<{ message: string; article: Article }>(`/articles/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/articles/${id}`),
};
