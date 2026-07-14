import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import { Role } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AdminController {
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await AdminService.getUsers();
    res.json(users);
  });

  static getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const data = await AdminService.getAnalytics();
    res.json(data);
  });

  static updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const user = await AdminService.updateUserRole(req.params.id as string, req.body.role as Role);
    res.json(user);
  });

  static getRoleRequests = asyncHandler(async (req: Request, res: Response) => {
    const requests = await AdminService.getRoleRequests();
    res.json(requests);
  });

  static updateRoleRequestStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const request = await AdminService.updateRoleRequestStatus(req.params.id as string, status);
    res.json(request);
  });
}
