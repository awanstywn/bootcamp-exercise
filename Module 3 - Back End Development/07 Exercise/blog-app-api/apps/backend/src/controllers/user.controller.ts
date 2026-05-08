// src/controllers/user.controller.ts
// User controller — thin layer that connects routes to services.
// Responsibility: extract data from req → call service → send res.json().
// Controllers must NOT contain business logic (no DB queries, no ownership checks).
// All errors are forwarded to the global error handler via next(err).

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

// GET /api/users — list all users
export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id — get single user by ID
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // :id from URL path — e.g., /api/users/abc123
    const user = await userService.getUserById(id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id — update user profile (protected route)
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;                   // Target user ID from URL
    const { name, bio, avatar } = req.body;      // Updated fields from request body
    // req.user!.userId comes from verifyJWT middleware — the currently logged-in user
    // Service layer checks if req.user.userId === id (ownership verification)
    const user = await userService.updateUser(req.user!.userId, id, { name, bio, avatar });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/articles — get all articles authored by a specific user
export const getArticlesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // User ID whose articles we want to fetch
    const articles = await userService.getArticlesByUserId(id);
    res.status(200).json({ articles });
  } catch (err) {
    next(err);
  }
};