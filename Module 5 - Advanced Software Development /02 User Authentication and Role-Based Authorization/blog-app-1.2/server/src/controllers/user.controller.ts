import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { Role } from '@prisma/client';

export class UserController {
  static async requestRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestedRole, reason } = req.body;
      const request = await UserService.requestRole(
        req.user!.id,
        requestedRole as Role,
        reason
      );
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  }

  static async getRoleRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await UserService.getRoleRequestStatus(req.user!.id);
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, bio, avatarUrl } = req.body;
      const user = await UserService.updateProfile(req.user!.id, { name, bio, avatarUrl });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
