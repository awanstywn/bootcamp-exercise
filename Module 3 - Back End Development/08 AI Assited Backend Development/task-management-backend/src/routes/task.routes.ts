/**
 * @fileoverview Task management routing configuration.
 * @objective To define and map task-related HTTP endpoints to their respective service handlers, enforcing authentication on all routes.
 * @logic
 * 1. Applies `authMiddleware` globally to ensure all task routes are protected.
 * 2. `/` (POST): Creates a new task for the authenticated user.
 * 3. `/` (GET): Retrieves a paginated and optionally filtered list of tasks for the user. Parses complex query parameters (status, priority, dates, search).
 * 4. `/:id` (GET, PUT, DELETE): Operations for fetching, updating, or soft-deleting a specific task belonging to the user.
 * 5. `/:id/restore` (POST): Restores a previously soft-deleted task.
 */
import { Router, Response } from 'express';
import { taskService } from '../services/task.service';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { validateRequest, taskValidation } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendError } from '../utils/response';
import { query, body } from 'express-validator';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validateRequest(taskValidation),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const task = await taskService.createTask(req.userId, req.body);
    sendSuccess(res, task, 201);
  }),
);

router.get(
  '/',
  validateRequest([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    query('due_after').optional().isISO8601(),
    query('due_before').optional().isISO8601(),
    query('search').optional().isString().trim(),
  ]),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const getQueryParam = (value: any): string | undefined => {
      return Array.isArray(value) ? value[0] : value;
    };

    const filters = {
      status: getQueryParam(req.query.status),
      priority: getQueryParam(req.query.priority),
      dueAfter: req.query.due_after ? new Date(getQueryParam(req.query.due_after) || '') : undefined,
      dueBefore: req.query.due_before ? new Date(getQueryParam(req.query.due_before) || '') : undefined,
      search: getQueryParam(req.query.search),
    };

    const pagination = {
      page: req.query.page ? parseInt(getQueryParam(req.query.page) || '1') : 1,
      limit: req.query.limit ? parseInt(getQueryParam(req.query.limit) || '20') : 20,
    };

    const result = await taskService.getTasks(req.userId, filters, pagination);
    sendSuccess(res, result);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.getTaskById(taskId, req.userId);
    sendSuccess(res, task);
  }),
);

router.put(
  '/:id',
  validateRequest(taskValidation),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.updateTask(taskId, req.userId, req.body);
    sendSuccess(res, task);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.deleteTask(taskId, req.userId);
    sendSuccess(res, task);
  }),
);

router.post(
  '/:id/restore',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.restoreTask(taskId, req.userId);
    sendSuccess(res, task);
  }),
);

export default router;
