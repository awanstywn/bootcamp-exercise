// packages/shared/src/types/article.types.ts
// Shared TypeScript interfaces for Article and related data.
// Ensures consistent type definitions for articles across the full stack.

export interface ArticleAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthor;
}
