// src/services/user.service.ts
// User business logic — handles user CRUD and fetching user-specific articles.
// All Prisma queries use `select` to explicitly exclude the password field from responses.
// Ownership checks ensure users can only modify their own profiles.

import prisma from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

// ── Read Operations ────────────────────────────────────────────────────────────

// Get all users — returns safe fields only (password is never exposed)
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      // password is intentionally omitted — never send passwords to the client
    },
  });
  return users;
};

// Get a single user by ID — throws 404 if not found
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

// ── Update Operations ──────────────────────────────────────────────────────────

// Update user profile — only the account owner can update their own profile
export const updateUser = async (
  userId: string,  // Currently logged-in user (from JWT)
  id: string,      // Target user ID (from URL params)
  data: { name?: string; bio?: string; avatar?: string }
) => {
  // Ownership check: compare the logged-in user's ID with the target ID.
  // Without this, any authenticated user could edit anyone's profile.
  if (userId !== id) {
    throw new AppError('Forbidden: not your account', 403); // 403 Forbidden
  }

  // Verify user exists before attempting update
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Prisma update — only provided fields will be changed (partial update)
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true, // Automatically updated by Prisma (@updatedAt in schema)
    },
  });

  return user;
};

// ── User's Articles ────────────────────────────────────────────────────────────────

// Get all articles authored by a specific user — includes author info
export const getArticlesByUserId = async (id: string) => {
  // Verify user exists first — return 404 if invalid user ID
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Fetch articles with related data
  const articles = await prisma.article.findMany({
    where: { authorId: id },
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