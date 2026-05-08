// src/api/user.api.ts
// User API endpoints — profile retrieval, update, and fetching a user's articles.
// Used by ProfilePage to display author info and their published articles.

import apiClient from './client';
import type { User, Article } from '@blog-app/shared';

export const userApi = {
  getAll: () =>
    apiClient.get<{ users: User[] }>('/users'),

  getById: (id: string) =>
    apiClient.get<{ user: User }>(`/users/${id}`),

  update: (id: string, data: { name?: string; bio?: string; avatar?: string }) =>
    apiClient.put<{ user: User }>(`/users/${id}`, data),

  getArticles: (id: string) =>
    apiClient.get<{ articles: Article[] }>(`/users/${id}/articles`),
};
