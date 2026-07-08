import prisma from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { Role } from '@prisma/client';

export class AdminService {
  static async getUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAnalytics() {
    const [users, posts, comments] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.post.count(),
      prisma.comment.count({ where: { deletedAt: null } }),
    ]);
    return { users, posts, comments };
  }

  static async updateUserRole(id: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    return prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  static async getRoleRequests() {
    return prisma.roleRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateRoleRequestStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const request = await prisma.roleRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundError('Role request not found');

    const updatedRequest = await prisma.roleRequest.update({
      where: { id },
      data: { status }
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole }
      });
    }

    return updatedRequest;
  }
}
