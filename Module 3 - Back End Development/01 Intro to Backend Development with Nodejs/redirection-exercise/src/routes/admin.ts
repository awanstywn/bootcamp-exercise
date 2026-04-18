/**
 * Admin Route
 * 
 * Operational management surface allowing trusted operators adjusting link mappings or resetting analytics.
 * Every endpoint explicitly enforces authentication blocking unauthorized modification securely.
 */

import { Router, Request, Response, NextFunction } from "express";
import { validateSlug } from "../middleware/validateSlug.js";
import { createLink, getAllLinks, updateLink, deleteLink } from "../services/linkService.js";
import { clearAnalytics } from "../services/analyticsService.js";
import { HttpError } from "../types/index.js";

const adminRouter = Router();

/**
 * Validates 'x-api-key' matches the securely configured environment master phrase before progressing requests.
 */
function adminAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];
  const validKey = process.env.ADMIN_API_KEY;

  if (!apiKey || apiKey !== validKey) {
    return next(new HttpError(401, "Unauthorized"));
  }
  next();
}

// Bind authentication securely protecting all sub-routing endpoints uniformly.
adminRouter.use(adminAuth);

/**
 * GET /api/links
 * Retrieves comprehensive collection covering existing link entries.
 */
adminRouter.get("/links", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await getAllLinks();
    res.status(200).json(links);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/links
 * Assembles newly assigned slug sequences securely connecting remote URLs natively.
 */
adminRouter.post("/links", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, url, description } = req.body;
    
    if (typeof slug !== "string" || typeof url !== "string") {
      throw new HttpError(400, "Body must include 'slug' and 'url' properties dynamically built as strings.");
    }

    await createLink(slug, url, description);
    
    res.status(201).json({
      message: "Link berhasil dibuat",
      slug,
      url
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/links/:slug
 * Updates preexisting target associations allowing modifying target sites cleanly.
 */
adminRouter.patch("/links/:slug", validateSlug, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      throw new HttpError(400, "URL string is explicitly required when updating links.");
    }

    await updateLink(slug, url);

    res.status(200).json({
      message: "Link berhasil diupdate",
      slug,
      url
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/links/:slug
 * Purges shortlinks definitively from available databases stopping further redirects natively.
 */
adminRouter.delete("/links/:slug", validateSlug, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    await deleteLink(slug);

    res.status(200).json({
      message: "Link berhasil dihapus",
      slug
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/analytics
 * Operates purely purging analytic storage metrics leaving blank states naturally.
 */
adminRouter.delete("/analytics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clearAnalytics();
    res.status(200).json({
      message: "Analytics berhasil direset"
    });
  } catch (error) {
    next(error);
  }
});

export default adminRouter;
