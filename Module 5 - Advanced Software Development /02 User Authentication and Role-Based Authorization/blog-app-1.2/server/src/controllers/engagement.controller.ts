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
import { Request, Response, NextFunction } from 'express';
import { EngagementService } from '../services/engagement.service.js';

export class EngagementController {
  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await EngagementService.getCommentsForPost(req.params.postId as string);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await EngagementService.addComment(req.user!.id, {
        ...req.body,
        postId: req.params.postId as string,
      });
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      await EngagementService.deleteComment(req.params.id as string, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EngagementService.toggleLike(req.user!.id, req.params.postId as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async checkLikeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EngagementService.checkLikeStatus(
        req.user!.id,
        req.params.postId as string,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
