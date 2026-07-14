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
import { Request, Response } from 'express';
import { ContentService } from '../services/content.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ContentController {
  // --- POSTS ---
  static getPosts = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContentService.getPosts(req.query, req.user?.id, req.user?.role);
    res.locals.dataSource = result.source;
    res.json(result.data);
  });

  static getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContentService.getPostBySlug(
      req.params.slug as string,
      req.user?.id,
      req.user?.role,
    );
    res.locals.dataSource = result.source;
    res.json(result.data);
  });

  static createPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await ContentService.createPost(req.user!.id, req.body);
    res.status(201).json(post);
  });

  static updatePost = asyncHandler(async (req: Request, res: Response) => {
    const post = await ContentService.updatePost(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.body,
    );
    res.json(post);
  });

  static deletePost = asyncHandler(async (req: Request, res: Response) => {
    await ContentService.deletePost(req.params.id as string, req.user!.id, req.user!.role);
    res.status(204).send();
  });

  // --- CATEGORIES ---
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const cats = await ContentService.getCategories();
    res.json(cats);
  });

  static createCategory = asyncHandler(async (req: Request, res: Response) => {
    const cat = await ContentService.createCategory(req.body);
    res.status(201).json(cat);
  });

  // --- TAGS ---
  static getTags = asyncHandler(async (req: Request, res: Response) => {
    const tags = await ContentService.getTags();
    res.json(tags);
  });

  static createTag = asyncHandler(async (req: Request, res: Response) => {
    const tag = await ContentService.createTag(req.body);
    res.status(201).json(tag);
  });

  // --- AUTHORS ---
  static getAuthors = asyncHandler(async (req: Request, res: Response) => {
    const authors = await ContentService.getAuthors();
    res.json(authors);
  });
}
