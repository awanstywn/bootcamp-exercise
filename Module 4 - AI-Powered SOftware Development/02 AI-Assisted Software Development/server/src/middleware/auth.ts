/**
 * @fileoverview Express middleware for JWT-based authentication.
 * 
 * Relations:
 * - Consumes: `jsonwebtoken` and `prisma` to verify tokens and fetch the user.
 * - Used by: Protected routes in `*.routes.ts` (e.g., creating products, fetching profile).
 * 
 * Logic:
 * - Extracts the Bearer token from the `Authorization` header.
 * - Verifies the token using `JWT_SECRET` and finds the corresponding user in the database.
 * - Injects the `user` object into the Express `Request` object for downstream handlers.
 * - Returns a 401 Unauthorized if verification fails.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};
