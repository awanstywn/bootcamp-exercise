/**
 * Redirect Route
 * 
 * Main worker module resolving mapped slugs pushing viewers towards correct target links.
 * Orchestrates limiters securely preventing link flooding while hooking silently into analytic engines.
 */

import { Router, Request, Response, NextFunction } from "express";
import { redirectLimiter } from "../middleware/rateLimit.js";
import { validateSlug } from "../middleware/validateSlug.js";
import { resolveLink } from "../services/linkService.js";
import { recordVisit } from "../services/analyticsService.js";
import { HttpError } from "../types/index.js";

const redirectRouter = Router();

/**
 * Handle dynamic slug redirection requests sequentially traversing custom limiters and filters.
 */
redirectRouter.get("/:slug", 
  redirectLimiter, 
  validateSlug, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      
      // Look up target URL natively matching against internal link structures
      const linkEntry = await resolveLink(slug!);
      
      if (!linkEntry) {
        throw new HttpError(404, "Link tidak ditemukan");
      }

      // We separate analytics tracking entirely preventing failing visits logs interrupting normal end-user flows
      recordVisit(slug!, req).catch(analyticsError => {
        console.error(`Failed logging backend analytic metric bounds:`, analyticsError);
      });

      console.log(`Redirecting: /${slug} → ${linkEntry.url}`);
      
      // Perform final HTTP location swap (Temporary Redirect) smoothly directing viewers
      res.redirect(302, linkEntry.url);

    } catch (error) {
      next(error); // Route errors onwards to specialized central handler sinks
    }
  }
);

export default redirectRouter;
