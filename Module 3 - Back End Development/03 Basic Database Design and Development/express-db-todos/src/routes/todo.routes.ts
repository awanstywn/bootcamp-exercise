/**
 * FILE: src/routes/todo.routes.ts
 * 
 * DESCRIPTION:
 * This file defines the API endpoints (routes) for the Todo resource and contains 
 * the core business logic (CRUD operations) directly within the route handlers.
 * 
 * INTERACTION:
 * - Imports the DB connection from `src/config/db.js` to execute queries.
 * - Exports the configured Express Router.
 * - The exported router is imported by `src/server.ts` and mounted onto the `/todos` prefix.
 */

import { Router, Request, Response, NextFunction } from "express";
import pool from "../config/db.js";

// Create a Router instance
const router = Router();

// =============================================
// GET /todos — Retrieve all todos
// =============================================
router.get("/", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY created_at DESC");
    res.status(200).json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// =============================================
// GET /todos/:id — Retrieve a single todo by ID
// =============================================
router.get("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// =============================================
// POST /todos — Create a new todo
// =============================================
router.post("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, author } = req.body as { title?: string; author?: string };

    if (!title || title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const result = await pool.query(
      "INSERT INTO todos (title, author) VALUES ($1, $2) RETURNING *",
      [title.trim(), author ? author.trim() : null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// =============================================
// PUT /todos/:id — Update an existing todo by ID
// =============================================
router.put("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, completed, author } = req.body as {
      title?: string;
      completed?: boolean;
      author?: string;
    };

    if (title === undefined && completed === undefined && author === undefined) {
      res.status(400).json({
        error: "At least one field must be provided (title, completed, or author)",
      });
      return;
    }

    const existing = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);

    if (existing.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.rows[0].title;
    const updatedCompleted = completed !== undefined ? completed : existing.rows[0].completed;
    const updatedAuthor = author !== undefined ? author.trim() : existing.rows[0].author;

    const result = await pool.query(
      "UPDATE todos SET title = $1, completed = $2, author = $3 WHERE id = $4 RETURNING *",
      [updatedTitle, updatedCompleted, updatedAuthor, id]
    );

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// =============================================
// DELETE /todos/:id — Delete a todo by ID
// =============================================
router.delete("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
