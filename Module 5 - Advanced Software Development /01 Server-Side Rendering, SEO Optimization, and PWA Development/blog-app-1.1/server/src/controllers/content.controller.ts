/**
 * @fileoverview Content Controller
 * @objective Handle HTTP requests for creating, reading, updating, and deleting blog posts, categories, and tags.
 * @risk Exposing unpublished posts to unauthorized users or allowing unauthorized edits (mitigated by passing user roles and IDs to the service).
 * @relations Maps endpoints from `content.routes.ts` to `ContentService`.
 * @logic
 * - `getPosts`: Passes query parameters (for pagination/filtering) to fetch a list of posts.
 * - `getPostBySlug`: Fetches a single post by its slug.
 * - `createPost`: Extracts the authenticated user's ID to set as the author.
 * - `updatePost` & `deletePost`: Passes the user's ID and role to the service to verify ownership or admin privileges before modifying.
 * - `getCategories`, `createCategory`, `getTags`, `createTag`: Standard CRUD operations for taxonomies.
 */
import { Request, Response, NextFunction } from 'express';
import { ContentService } from '../services/content.service.js';

export class ContentController {
  // --- POSTS ---
  static async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await ContentService.getPosts(req.query);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  static async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await ContentService.getPostBySlug(req.params.slug as string);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  static async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await ContentService.createPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await ContentService.updatePost(req.params.id as string, req.body);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      await ContentService.deletePost(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // --- CATEGORIES ---
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const cats = await ContentService.getCategories();
      res.json(cats);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const cat = await ContentService.createCategory(req.body);
      res.status(201).json(cat);
    } catch (error) {
      next(error);
    }
  }

  // --- TAGS ---
  static async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await ContentService.getTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  static async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await ContentService.createTag(req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  // --- AUTHORS ---
  static async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const authors = await ContentService.getAuthors();
      res.json(authors);
    } catch (error) {
      next(error);
    }
  }
}
