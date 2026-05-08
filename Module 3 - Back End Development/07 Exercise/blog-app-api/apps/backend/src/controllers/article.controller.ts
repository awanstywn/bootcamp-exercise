// src/controllers/article.controller.ts
// Article controller — thin layer that connects routes to services.
// Responsibility: extract data from req → call service → send res.json().
// Controllers must NOT contain business logic.
// All errors are forwarded to the global error handler via next(err).

import { Request, Response, NextFunction } from 'express';
import * as articleService from '../services/article.service';

// GET /api/articles — list all articles (public, no auth required)
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const searchBy = req.query.searchBy as string | undefined; // 'title', 'content', or 'all'
    const articles = await articleService.getAllArticles(search, searchBy);

    if (articles.length === 0) {
      // Return a 404 error if nothing matches the search
      return res.status(404).json({ error: 'there is no article' });
    }

    res.status(200).json({ articles });
  } catch (err) {
    next(err);
  }
};

// GET /api/articles/:id — get single article with full details (public)
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);
    res.status(200).json({ article });
  } catch (err) {
    next(err);
  }
};

// POST /api/articles — create a new article (protected route)
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, imageUrl, published } = req.body;
    const article = await articleService.createArticle(req.user!.userId, title, content, imageUrl, published);

    res.status(201).json({
      message: 'Article created',
      article,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/articles/:id — update an existing article (protected + ownership check in service)
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl, published } = req.body;
    const article = await articleService.updateArticle(req.user!.userId, id, { title, content, imageUrl, published });

    res.status(200).json({
      message: 'Article updated',
      article,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/articles/:id — delete an article (protected + ownership check)
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await articleService.deleteArticle(req.user!.userId, id);

    res.status(200).json({
      message: 'Article deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};