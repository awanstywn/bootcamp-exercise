import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'AUTHOR', 'SUBSCRIBER'])
});

export const updateRoleRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});
