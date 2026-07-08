import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { Role } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';

export class UserController {
  static requestRole = asyncHandler(async (req: Request, res: Response) => {
    const { requestedRole, reason } = req.body;
    const request = await UserService.requestRole(
      req.user!.id,
      requestedRole as Role,
      reason
    );
    res.status(201).json(request);
  });

  static getRoleRequestStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await UserService.getRoleRequestStatus(req.user!.id);
    res.json(status);
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { name, bio, avatarUrl } = req.body;
    const user = await UserService.updateProfile(req.user!.id, { name, bio, avatarUrl });
    res.json(user);
  });
}
