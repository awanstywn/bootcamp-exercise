/**
 * @fileoverview Content Service
 * @objective Core business logic for managing categories, tags, and posts, including complex querying and mutation constraints.
 * @risk Improperly constructed queries could leak draft/archived posts to unauthorized users. Slug collisions must be handled to prevent database unique constraint errors.
 * @relations Called by `content.controller.ts`. Interacts heavily with `prisma`.
 * @logic
 * - `getPosts`: Builds a dynamic `Prisma.PostWhereInput` based on query parameters (status, author, category, tags, full-text search). Fetches paginated results and total counts concurrently.
 * - `getPostBySlug`: Fetches a single post and eagerly loads relations (author, category, tags, counts). Also asynchronously increments the `viewCount`.
 * - `createPost`: Generates a URL-friendly slug. If the slug exists, it appends a random string to guarantee uniqueness. Connects tags and categories.
 * - `updatePost`: Validates ownership/admin rights. Regenerates the slug only if the title changes and checks for collisions. Updates relationships using `set`.
 * - `deletePost`: Validates ownership or ADMIN role before issuing a delete command to the database.
 */
import { Prisma, PostStatus } from '@prisma/client';

export interface GetPostsQuery {
  page?: string;
  limit?: string;
  status?: PostStatus | 'ALL';
  authorId?: string;
  authorName?: string;
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
}

export interface PostInputData {
  title: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  metaTitle?: string;
  metaDescription?: string;
  coverImageUrl?: string;
  categoryId?: string;
  tags?: string[];
  scheduledAt?: string;
}

import prisma from '../db/prisma.js';
import { generateSlug } from '../utils/slug.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { getPaginationOptions, createPaginatedResponse } from '../utils/pagination.js';
import { CacheService } from './cache.service.js';
import { logger } from '../config/logger.js';
import { publishQueue } from '../config/queue.js';

export class ContentService {
  // --- CATEGORIES ---
  static async getCategories() {
    return prisma.category.findMany({ include: { _count: { select: { posts: true } } } });
  }

  static async createCategory(data: { name: string }) {
    const slug = generateSlug(data.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new BadRequestError('Category already exists');
    return prisma.category.create({ data: { name: data.name, slug } });
  }

  // --- TAGS ---
  static async resolveTags(tagNames: string[]) {
    if (!tagNames || tagNames.length === 0) return [];
    
    const uniqueNames = [...new Set(tagNames)];
    
    const existingTags = await prisma.tag.findMany({
      where: { name: { in: uniqueNames } }
    });
    
    const existingNames = new Set(existingTags.map(t => t.name));
    const newNames = uniqueNames.filter(name => !existingNames.has(name));
    
    if (newNames.length > 0) {
      await prisma.tag.createMany({
        data: newNames.map(name => ({ name, slug: generateSlug(name) })),
        skipDuplicates: true,
      });
      
      const createdTags = await prisma.tag.findMany({
        where: { name: { in: newNames } }
      });
      return [...existingTags, ...createdTags];
    }
    
    return existingTags;
  }

  static async getTags() {
    return prisma.tag.findMany({ include: { _count: { select: { posts: true } } } });
  }

  static async createTag(data: { name: string }) {
    const slug = generateSlug(data.name);
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) throw new BadRequestError('Tag already exists');
    return prisma.tag.create({ data: { name: data.name, slug } });
  }

  // --- AUTHORS ---
  static async getAuthors() {
    return prisma.user.findMany({
      where: {
        role: { in: ['AUTHOR', 'ADMIN'] },
        posts: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
    });
  }

  // --- POSTS ---
  static async getPosts(query: GetPostsQuery, userId?: string, userRole?: string) {
    const { page, limit, skip } = getPaginationOptions(query.page, query.limit);

    const where: Prisma.PostWhereInput = {};
    if (query.status === 'ALL') {
      // No status filter
    } else if (query.status) {
      where.status = query.status;
    } else {
      where.status = 'PUBLISHED'; // Safe default for public feeds
    }

    // Security check: Prevent non-authors from viewing drafts/archived posts
    if (where.status !== 'PUBLISHED' && query.status !== 'PUBLISHED') {
      if (userRole !== 'ADMIN') {
        if (!userId) throw new ForbiddenError('Not authorized');
        // If they are not an admin, force the authorId to be themselves
        where.authorId = userId;
      }
    }
    if (query.authorId) where.authorId = query.authorId;
    if (query.authorName) {
      const decodedName = decodeURIComponent(query.authorName).replace(/-/g, ' ');
      where.author = { name: { equals: decodedName, mode: 'insensitive' } };
    }
    if (query.category) where.category = { slug: query.category };
    if (query.tag) where.tags = { some: { slug: query.tag } };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'popular') {
      orderBy = { viewCount: 'desc' };
    } else if (query.sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (query.sort === 'title_asc') {
      orderBy = { title: 'asc' };
    } else if (query.sort === 'title_desc') {
      orderBy = { title: 'desc' };
    }

    const cacheKey = `posts:list:${JSON.stringify(query)}:${userId || 'anon'}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      logger.info('[Cache] Returning articles from cache');
      return { data: cached, source: 'CACHE' };
    }

    logger.info('[DB] Fetching articles from database');
    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          metaTitle: true,
          metaDescription: true,
          coverImageUrl: true,
          status: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          scheduledAt: true,
          publishedAt: true,
          authorId: true,
          categoryId: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          category: true,
          tags: true,
          _count: { select: { comments: true, likes: true } },
        },
      }),
    ]);

    const responseData = createPaginatedResponse(posts, total, page, limit);
    await CacheService.set(cacheKey, responseData);
    return { data: responseData, source: 'DB' };
  }

  static async getPostBySlug(slug: string, userId?: string, userRole?: string) {
    const cacheKey = `posts:slug:${slug}`;
    const cached = await CacheService.get(cacheKey);

    const includeQuery = {
      author: { select: { id: true, name: true, avatarUrl: true, bio: true } },
      category: true,
      tags: true,
      _count: { select: { comments: true, likes: true } },
    } satisfies Prisma.PostInclude;

    let post: Prisma.PostGetPayload<{ include: typeof includeQuery }> | null = null;

    if (cached) {
      logger.info(`[Cache] Returning article ${slug} from cache`);
      post = cached as Prisma.PostGetPayload<{ include: typeof includeQuery }>;
    } else {
      logger.info(`[DB] Fetching article ${slug} from database`);
      post = await prisma.post.findUnique({
        where: { slug },
        include: includeQuery,
      });
    }

    if (!post) throw new NotFoundError('Post not found');

    if (!cached) {
      await CacheService.set(cacheKey, post);
    }

    if (post.status !== 'PUBLISHED') {
      if (post.authorId !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenError('This post is not available to the public');
      }
    }

    // Increment view count in background
    prisma.post
      .update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(err => logger.error('Failed to increment view count', err));

    return { data: post, source: cached ? 'CACHE' : 'DB' };
  }

  static async createPost(userId: string, data: PostInputData) {
    const slug = generateSlug(data.title);

    // Check if slug exists, append random if needed (simple implementation)
    const existing = await prisma.post.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Math.random().toString(36).substring(7)}` : slug;

    let tagsConnect = undefined;
    if (data.tags && Array.isArray(data.tags)) {
      const resolvedTags = await ContentService.resolveTags(data.tags);
      tagsConnect = { connect: resolvedTags.map(t => ({ id: t.id })) };
    }

    let scheduledDate: Date | undefined;
    let publishedDate: Date | undefined;
    
    if (data.status === 'SCHEDULED') {
      if (!data.scheduledAt) throw new BadRequestError('scheduledAt is required for scheduled posts');
      scheduledDate = new Date(data.scheduledAt);
      if (scheduledDate <= new Date()) throw new BadRequestError('scheduledAt must be in the future');
    } else if (data.status === 'PUBLISHED') {
      publishedDate = new Date();
    }

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: finalSlug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        coverImageUrl: data.coverImageUrl,
        authorId: userId,
        categoryId: data.categoryId,
        tags: tagsConnect,
        scheduledAt: scheduledDate,
        publishedAt: publishedDate,
      },
      include: { category: true, tags: true },
    });
    
    if (data.status === 'SCHEDULED' && scheduledDate) {
      const delay = scheduledDate.getTime() - Date.now();
      if (publishQueue) {
        await publishQueue.add('publish', { postId: post.id }, { delay, jobId: `publish-${post.id}` });
      } else {
        logger.warn(`[ContentService] BullMQ unavailable. Scheduled publish for post ${post.id} will not be queued.`);
      }
    }

    await CacheService.delByPattern('posts:*');
    return post;
  }

  static async updatePost(id: string, userId: string, userRole: string, data: Partial<PostInputData>) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundError('Post not found');

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to edit this post');
    }

    let tagsConfig = undefined;
    if (data.tags && Array.isArray(data.tags)) {
      const resolvedTags = await ContentService.resolveTags(data.tags);
      tagsConfig = { set: resolvedTags.map(t => ({ id: t.id })) };
    }
    
    let finalSlug = post.slug;

    if (data.title && data.title !== post.title) {
      finalSlug = generateSlug(data.title);
      const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== id) {
        finalSlug = `${finalSlug}-${Math.random().toString(36).substring(7)}`;
      }
    }
    
    let scheduledDate: Date | null | undefined = undefined;
    let publishedDate: Date | null | undefined = undefined;

    if (data.status === 'SCHEDULED') {
      if (!data.scheduledAt && !post.scheduledAt) throw new BadRequestError('scheduledAt is required for scheduled posts');
      scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : post.scheduledAt;
      if (scheduledDate && scheduledDate <= new Date()) throw new BadRequestError('scheduledAt must be in the future');
    } else if (data.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
      publishedDate = new Date();
      scheduledDate = null;
    } else if (data.status) {
      scheduledDate = null;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: finalSlug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        coverImageUrl: data.coverImageUrl,
        categoryId: data.categoryId,
        tags: tagsConfig,
        ...(scheduledDate !== undefined && { scheduledAt: scheduledDate }),
        ...(publishedDate !== undefined && { publishedAt: publishedDate }),
      },
      include: { category: true, tags: true },
    });
    
    if (publishQueue) {
      if (data.status === 'SCHEDULED' && updatedPost.scheduledAt) {
        const delay = updatedPost.scheduledAt.getTime() - Date.now();
        await publishQueue.add('publish', { postId: updatedPost.id }, { delay, jobId: `publish-${updatedPost.id}` });
      } else if (data.status && data.status !== 'SCHEDULED') {
        const job = await publishQueue.getJob(`publish-${updatedPost.id}`);
        if (job) await job.remove();
      }
    }

    await CacheService.delByPattern('posts:*');
    return updatedPost;
  }

  static async deletePost(id: string, userId: string, userRole: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundError('Post not found');

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to delete this post');
    }

    const deletedPost = await prisma.post.delete({ where: { id } });
    await CacheService.delByPattern('posts:*');
    return deletedPost;
  }
}
