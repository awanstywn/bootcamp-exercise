import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { Role } from '@prisma/client';

export class AdminController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAnalytics();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.updateUserRole(req.params.id as string, req.body.role as Role);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getRoleRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await AdminService.getRoleRequests();
      res.json(requests);
    } catch (error) {
      next(error);
    }
  }

  static async updateRoleRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const request = await AdminService.updateRoleRequestStatus(req.params.id as string, status);
      res.json(request);
    } catch (error) {
      next(error);
    }
  }
}
