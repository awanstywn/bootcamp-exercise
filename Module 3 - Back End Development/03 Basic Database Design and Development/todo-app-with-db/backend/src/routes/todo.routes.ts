/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: routes/todo.routes.ts (Merged Route + Handler)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Handles all Todo-related operations (CRUD, search, filter, reorder).
 *   Combines Route definitions and Handler logic to reduce project complexity.
 *   All endpoints in this file are PROTECTED and require a valid JWT token.
 *
 * RELATIONS:
 *   - server.ts            → Mounts this router at /api/todos
 *   - services/todo.service.ts → Executes SQL operations on the 'todos' table
 *   - middleware/authenticate.ts → Verifies JWT and provides req.userId
 *   - middleware/validateBody.ts → Ensures required fields are present
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response, NextFunction } from 'express';
import { todoService } from '../services/todo.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validateBody.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// --- Todo Handlers ---

/** GET /api/todos/shared/:id - Get a public shared todo */
const getShared = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const todo = await todoService.getShared(id);
    res.status(200).json({ todo });
  } catch (error) {
    next(error);
  }
};

/** GET /api/todos - Get all todos for the logged-in user */
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos = await todoService.getAllByUser(req.userId);
    res.status(200).json({ todos });
  } catch (error) {
    next(error);
  }
};

/** GET /api/todos/search?q=keyword - Search todos by text (ILIKE) */
const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q) throw new AppError(400, 'VALIDATION_ERROR', "Query parameter 'q' is required");
    const result = await todoService.searchByText(req.userId, q);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/** GET /api/todos/filter?status=active|completed|all - Filter by completion status */
const filterByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as string) || 'all';
    const todos = await todoService.filterByStatus(req.userId, status);
    res.status(200).json({ todos });
  } catch (error) {
    next(error);
  }
};

/** GET /api/todos/regex?pattern=^Buy - Search using PostgreSQL regex (~) */
const searchRegex = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pattern = req.query.pattern as string;
    if (!pattern) throw new AppError(400, 'VALIDATION_ERROR', "Query parameter 'pattern' is required");
    const todos = await todoService.searchByRegex(req.userId, pattern);
    res.status(200).json({ todos });
  } catch (error) {
    next(error);
  }
};

/** GET /api/todos/:id - Get details of a single todo */
const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const todos = await todoService.getAllByUser(req.userId);
    const todo = todos.find((t: any) => t.id === id);
    if (!todo) throw new AppError(404, 'NOT_FOUND', 'Todo not found');
    res.status(200).json({ todo });
  } catch (error) {
    next(error);
  }
};

/** POST /api/todos - Create a new todo */
const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const todo = await todoService.create(req.userId, text);
    res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/todos/:id - Update todo text, completion, or index */
const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const todo = await todoService.update(id, req.userId, req.body);
    res.status(200).json({ todo });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/todos/:id - Delete a single todo */
const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await todoService.remove(id, req.userId);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/todos/completed - Clear all completed todos */
const clearCompleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await todoService.clearCompleted(req.userId);
    res.status(200).json({
      message: `${result.deletedCount} completed todos removed`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/todos/reorder - Bulk update manual_index (drag-and-drop) */
const reorder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { updates } = req.body;
    await todoService.reorder(req.userId, updates);
    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Route Definitions ---

// Public Route for Shared Link
router.get('/shared/:id', getShared);

// All todo routes require authentication
router.use(authenticate);

// Specific paths must come BEFORE parametric paths (:id)
router.get('/search', search);
router.get('/filter', filterByStatus);
router.get('/regex', searchRegex);
router.delete('/completed', clearCompleted);
router.put('/reorder', validateBody(['updates']), reorder);

// Basic CRUD
router.get('/', getAll);
router.post('/', validateBody(['text']), create);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
