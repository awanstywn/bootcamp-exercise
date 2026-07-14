/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import prisma from '../db/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { Role } from '@prisma/client';

export class UserService {
  static async requestRole(userId: string, requestedRole: Role, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    if (user.role === requestedRole) throw new BadRequestError(`You already have the ${requestedRole} role`);
    if (user.role === 'ADMIN') throw new BadRequestError('You are already an Admin');

    return prisma.roleRequest.upsert({
      where: { userId },
      update: {
        requestedRole,
        reason,
        status: 'PENDING',
      },
      create: {
        userId,
        requestedRole,
        reason,
        status: 'PENDING',
      }
    });
  }

  static async getRoleRequestStatus(userId: string) {
    return prisma.roleRequest.findUnique({ where: { userId } });
  }

  static async updateProfile(userId: string, data: { name?: string; bio?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl
      },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true }
    });
  }
}
