// src/services/article.service.ts
// Article business logic — handles article CRUD with Prisma queries.
// Uses `include` to fetch related data (author) in a single query.
// Ownership checks ensure only the original author can update or delete their own articles.

import prisma from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

// ── Read Operations ────────────────────────────────────────────────────────────

// Get all articles (public)
export const getAllArticles = async (search?: string, searchBy?: string) => {
  const whereClause: any = {
    published: true, // ALWAYS strictly enforced
  };

  if (search) {
    if (searchBy === 'title') {
      whereClause.title = { contains: search, mode: 'insensitive' };
    } else if (searchBy === 'content') {
      whereClause.content = { contains: search, mode: 'insensitive' };
    } else {
      // Default: search in BOTH title and content (the 'all' mode)
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Newest articles first
    },
  });
  return articles;
};

// Get a single article by ID (public)
export const getArticleById = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // If we want public users to only see published posts:
  if (!article.published) {
    throw new AppError('Article not found or not published', 404);
  }

  return article;
};

// ── Write Operations ───────────────────────────────────────────────────────────

// Create a new article
export const createArticle = async (authorId: string, title: string, content: string, imageUrl?: string, published?: boolean) => {
  const article = await prisma.article.create({
    data: {
      title,
      content,
      imageUrl,
      published,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return article;
};

// Update an article
export const updateArticle = async (
  userId: string,
  id: string,
  data: { title?: string; content?: string; imageUrl?: string; published?: boolean }
) => {
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  if (article.authorId !== userId) {
    throw new AppError('Forbidden: not your article', 403);
  }

  const updatedArticle = await prisma.article.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedArticle;
};

// Delete an article
export const deleteArticle = async (userId: string, id: string) => {
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  if (article.authorId !== userId) {
    throw new AppError('Forbidden: not your article', 403);
  }

  await prisma.article.delete({ where: { id } });
};