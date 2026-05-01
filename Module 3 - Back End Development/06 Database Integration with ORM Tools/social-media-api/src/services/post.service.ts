// src/services/post.service.ts
// Post business logic — handles post CRUD with Prisma queries.
// Uses `include` to fetch related data (author, comments, likes) in a single query.
// Ownership checks ensure only the original author can update their own posts.

import prisma from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

// ── Read Operations ────────────────────────────────────────────────────────────

// Get all posts — includes author info and engagement counts (comments/likes)
export const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      // `include` fetches related records in a single SQL JOIN.
      // `select` inside include picks specific fields from the related record.
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          // password excluded — never expose even through relations
        },
      },
      // `_count` returns the count of related records without fetching them all.
      // More efficient than fetching all comments/likes just to count them.
      _count: {
        select: {
          comments: true, // Number of comments on this post
          likes: true,    // Number of likes on this post
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Newest posts first
    },
  });
  return posts;
};

// Get a single post by ID — returns full details including comments and likes
export const getPostById = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      // For detail view: fetch FULL comment and like records (not just counts)
      comments: {
        include: {
          // Nested include — each comment also loads its author's info
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Newest comments first
        },
      },
      likes: {
        include: {
          // Each like record includes who liked the post
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
};

// ── Write Operations ───────────────────────────────────────────────────────────

// Create a new post — authorId links the post to the authenticated user
export const createPost = async (authorId: string, content: string, imageUrl?: string) => {
  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,       // Optional — can be undefined (Prisma treats undefined as "don't set")
      authorId,       // Foreign key linking to the User who created this post
    },
    include: {
      // Return author info alongside the newly created post
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return post;
};

// Update a post — only the original author can modify their own post
export const updatePost = async (
  userId: string,   // Currently logged-in user (from JWT)
  id: string,       // Target post ID (from URL params)
  data: { content?: string; imageUrl?: string }
) => {
  // Step 1: Find the post to verify it exists and check ownership
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Step 2: Ownership check — compare post's authorId with the logged-in user's ID
  if (post.authorId !== userId) {
    throw new AppError('Forbidden: not your post', 403);
  }

  // Step 3: Perform the update — only provided fields will be changed
  const updatedPost = await prisma.post.update({
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

  return updatedPost;
};