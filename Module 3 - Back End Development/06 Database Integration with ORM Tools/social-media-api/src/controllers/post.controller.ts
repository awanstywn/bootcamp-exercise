// src/controllers/post.controller.ts
// Post controller — thin layer that connects routes to services.
// Responsibility: extract data from req → call service → send res.json().
// Controllers must NOT contain business logic (no DB queries, no ownership checks).
// All errors are forwarded to the global error handler via next(err).

import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/post.service';

// GET /api/posts — list all posts (public, no auth required)
export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await postService.getAllPosts();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id — get single post with full details (public)
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // :id from URL path — e.g., /api/posts/abc123
    const post = await postService.getPostById(id);
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts — create a new post (protected route)
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, imageUrl } = req.body;
    // req.user! — non-null assertion is safe here because verifyJWT middleware
    // already validated the token and injected req.user before this handler runs.
    const post = await postService.createPost(req.user!.userId, content, imageUrl);

    // 201 Created — a new resource (post) was successfully created
    res.status(201).json({
      message: 'Post created',
      post,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id — update an existing post (protected + ownership check in service)
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;                   // Target post ID from URL
    const { content, imageUrl } = req.body;      // Updated fields from request body
    // Service layer verifies post.authorId === req.user.userId before updating
    const post = await postService.updatePost(req.user!.userId, id, { content, imageUrl });

    res.status(200).json({
      message: 'Post updated',
      post,
    });
  } catch (err) {
    next(err);
  }
};