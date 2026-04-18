/**
 * Slug Validator Middleware
 * 
 * Ensures slugs retrieved strictly correspond to internal structural rules preventing malformed query handling.
 */

import { Request, Response, NextFunction } from "express";
import { isValidSlug } from "../utils/sanitize.js";
import { HttpError } from "../types/index.js";

/**
 * Validates dynamic paths matching the standard slug specifications.
 * Intercepts invalid formations forwarding HttpError seamlessly.
 */
export function validateSlug(req: Request, res: Response, next: NextFunction): void {
  const slug = req.params.slug as string;

  if (!slug || !isValidSlug(slug)) {
    // Calling next with an error parameter skips standard workflows instantly delegating tasks towards `errorHandler`.
    return next(new HttpError(400, "Format slug tidak valid — hanya huruf, angka, - dan _ diperbolehkan"));
  }

  // Passing successfully when standard boundaries operate freely
  next();
}
