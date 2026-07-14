/**
 * @fileoverview Engagement Controller
 * @objective Handle HTTP requests related to user engagement features, specifically comments and likes on posts.
 * @risk Unauthorized users modifying or deleting other users' comments if ownership checks are missing (handled in Service).
 * @relations Maps endpoints from `engagement.routes.ts` to `EngagementService`.
 * @logic
 * - `getComments`: Fetches all comments for a specific post.
 * - `addComment`: Extracts `req.user.id` and passes the comment payload to the service.
 * - `deleteComment`: Calls the service with the user's ID and role to ensure they have permission to delete the comment.
 * - `toggleLike` & `checkLikeStatus`: Manages liking/unliking a post for the authenticated user.
 */
import { Request, Response } from 'express';
import { EngagementService } from '../services/engagement.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class EngagementController {
  static getComments = asyncHandler(async (req: Request, res: Response) => {
    const comments = await EngagementService.getCommentsForPost(req.params.postId as string);
    res.json(comments);
  });

  static addComment = asyncHandler(async (req: Request, res: Response) => {
    const comment = await EngagementService.addComment(req.user!.id, {
      ...req.body,
      postId: req.params.postId as string,
    });
    res.status(201).json(comment);
  });

  static deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await EngagementService.deleteComment(req.params.id as string, req.user!.id, req.user!.role);
    res.status(204).send();
  });

  static toggleLike = asyncHandler(async (req: Request, res: Response) => {
    const result = await EngagementService.toggleLike(req.user!.id, req.params.postId as string);
    res.json(result);
  });

  static checkLikeStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await EngagementService.checkLikeStatus(
      req.user!.id,
      req.params.postId as string,
    );
    res.json(result);
  });
}
