/**
 * @fileoverview Engagement Service
 * @objective Manage business logic for user interactions, specifically comments and likes on posts.
 * @risk Failing to verify `authorId` before deleting a comment allows users to delete comments they don't own.
 * @relations Called by `engagement.controller.ts`. Interacts with `prisma`.
 * @logic
 * - `getCommentsForPost`: Fetches top-level approved comments for a post, including nested replies (up to one level deep due to Prisma schema limits or explicit includes), ordered by creation date.
 * - `addComment`: Validates the existence of the parent post (and parent comment if threaded), creates the comment, and links it to the author.
 * - `deleteComment`: Verifies the comment exists and the requester is either the author or an ADMIN before deleting.
 * - `toggleLike`: Checks if the user already liked the post. If yes, it removes the like; if no, it creates a like.
 * - `checkLikeStatus`: Returns a boolean indicating if the current user has liked a specific post.
 */
import prisma from '../db/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class EngagementService {
  // --- COMMENTS ---
  static async getCommentsForPost(postId: string) {
    return prisma.comment.findMany({
      where: { postId, parentId: null, status: 'APPROVED' }, // Only top-level approved
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          where: { status: 'APPROVED' },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async addComment(
    userId: string,
    data: { content: string; postId: string; parentId?: string },
  ) {
    const post = await prisma.post.findUnique({ where: { id: data.postId } });
    if (!post) throw new NotFoundError('Post not found');

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
      if (!parent || parent.postId !== data.postId)
        throw new NotFoundError('Parent comment not found or mismatch');
    }

    return prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        parentId: data.parentId,
        authorId: userId,
        status: 'APPROVED', // Simulating auto-approve. Could be PENDING based on site settings
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  static async deleteComment(id: string, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to delete this comment');
    }

    return prisma.comment.delete({ where: { id } });
  }

  // --- LIKES ---
  static async toggleLike(userId: string, postId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await prisma.like.create({ data: { userId, postId } });
      return { liked: true };
    }
  }

  static async checkLikeStatus(userId: string, postId: string) {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return { liked: !!existing };
  }
}
