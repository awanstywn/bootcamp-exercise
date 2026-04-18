/**
 * Health Route
 * 
 * Provides an extremely fast mechanism enabling external uptime monitors and deployment 
 * infrastructures (like Railway's healthchecks) to verify instance vitality.
 */

import { Router, Request, Response } from "express";

const healthRouter = Router();

// Returns status 200 explicitly returning raw plain text formatted quickly string "ok"
healthRouter.get("/health", (req: Request, res: Response) => {
  res.status(200).type("text/plain").send("ok");
});

export default healthRouter;
