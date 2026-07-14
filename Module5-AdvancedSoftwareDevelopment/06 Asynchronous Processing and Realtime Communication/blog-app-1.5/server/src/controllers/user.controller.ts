/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
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
