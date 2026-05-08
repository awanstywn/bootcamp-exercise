/**
 * @fileoverview Task management business logic service.
 * @objective To handle all database operations and business rules related to task entities.
 * @logic
 * 1. `createTask`: Inserts a new task into the database, associating it with the creating user and setting default values for status and priority.
 * 2. `getTasks`: Retrieves a paginated list of tasks. Dynamically constructs complex Prisma queries based on applied filters (status, priority, due dates) and full-text search.
 * 3. `getTaskById`, `updateTask`: Fetches or modifies a specific task, ensuring the task belongs to the requesting user and is not soft-deleted.
 * 4. `deleteTask`: Implements soft deletion by setting a `deletedAt` timestamp rather than permanently removing the record.
 * 5. `restoreTask`: Reverts a soft deletion by clearing the `deletedAt` timestamp.
 */
import { prisma } from '../prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
}

export interface TaskFilterInput {
  status?: string;
  priority?: string;
  dueAfter?: Date;
  dueBefore?: Date;
  search?: string;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export class TaskService {
  async createTask(userId: string, input: CreateTaskInput) {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: (input.status as any) || 'TODO',
        priority: (input.priority as any) || 'MEDIUM',
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        userId,
      },
    });

    return task;
  }

  async getTasks(
    userId: string,
    filters: TaskFilterInput,
    pagination: PaginationInput,
  ): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      userId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.priority) {
      where.priority = filters.priority as any;
    }

    if (filters.dueAfter || filters.dueBefore) {
      where.dueDate = {};
      if (filters.dueAfter) {
        (where.dueDate as any).gte = new Date(filters.dueAfter);
      }
      if (filters.dueBefore) {
        (where.dueDate as any).lte = new Date(filters.dueBefore);
      }
    }

    if (filters.search) {
      const searchTerm = filters.search.trim().split(/\\s+/).join(' & ');
      if (searchTerm) {
        where.OR = [
          { title: { search: searchTerm } },
          { description: { search: searchTerm } },
        ];
      }
    }

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId, deletedAt: null },
    });

    if (!task) {
      throw new AppError(404, 'Task not found or not authorized');
    }

    return task;
  }

  async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    const result = await prisma.task.updateMany({
      where: { id: taskId, userId, deletedAt: null },
      data: {
        title: input.title,
        description: input.description,
        status: input.status as any,
        priority: input.priority as any,
        dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
      },
    });

    if (result.count === 0) {
      throw new AppError(404, 'Task not found or not authorized');
    }

    return prisma.task.findFirst({ where: { id: taskId } });
  }

  async deleteTask(taskId: string, userId: string) {
    const result = await prisma.task.updateMany({
      where: { id: taskId, userId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new AppError(404, 'Task not found or not authorized');
    }

    return { success: true, message: 'Task deleted successfully' };
  }

  async restoreTask(taskId: string, userId: string) {
    const result = await prisma.task.updateMany({
      where: { id: taskId, userId, deletedAt: { not: null } },
      data: {
        deletedAt: null,
      },
    });

    if (result.count === 0) {
      throw new AppError(404, 'Task not found, not authorized, or not deleted');
    }

    return prisma.task.findFirst({ where: { id: taskId } });
  }
}

export const taskService = new TaskService();
