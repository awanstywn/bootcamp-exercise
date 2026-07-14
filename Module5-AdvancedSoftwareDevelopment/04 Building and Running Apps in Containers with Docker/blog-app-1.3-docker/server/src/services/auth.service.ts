/**
 * @fileoverview Authentication Service
 * @objective Encapsulate the core business logic for user registration, login, token refresh, and third-party OAuth.
 * @risk Contains sensitive logic (password hashing/comparison). Logic bugs here can compromise the entire application's security.
 * @relations Called by `auth.controller.ts`. Interacts with `TokenService`, `EmailService`, and `prisma`.
 * @logic
 * - `register`: Checks for existing email, hashes password with bcrypt, creates user, sends welcome email, and generates tokens.
 * - `login`: Validates credentials (email existence and password match) and generates tokens.
 * - `refresh`: Verifies the refresh token, checks the DB for revocation/rotation, revokes the old token, and generates a new pair.
 * - `logout`: Marks the specific refresh token as revoked in the DB.
 * - `googleOAuth`: Finds or creates a user based on their Google profile, linking their `googleId` and generating tokens.
 */
import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { TokenService } from './token.service.js';
import { EmailService } from './email.service.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    
    // Encrypt the password hash before putting it in the JWT to prevent offline brute-force if intercepted
    const key = crypto.scryptSync(env.JWT_ACCESS_SECRET, 'blog-app-registration-v1', 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let eh = cipher.update(passwordHash, 'utf8', 'hex');
    eh += cipher.final('hex');
    const at = cipher.getAuthTag().toString('hex');
    
    // Instead of creating the user, we issue a JWT for verification
    const token = jwt.sign(
      { 
        purpose: 'register',
        email: input.email,
        name: input.name,
        eh,
        iv: iv.toString('hex'),
        at
      }, 
      env.JWT_ACCESS_SECRET, 
      { expiresIn: '15m' }
    );

    // Send verification email asynchronously
    // eslint-disable-next-line no-console
    EmailService.sendVerificationEmail(input.email, token).catch(console.error);

    return { message: 'Verification email sent' };
  }

  static async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { 
        purpose: string, 
        email: string, 
        name: string, 
        eh: string,
        iv: string,
        at: string
      };
      
      if (decoded.purpose !== 'register') {
        throw new Error('Invalid token purpose');
      }

      // Decrypt password hash
      const key = crypto.scryptSync(env.JWT_ACCESS_SECRET, 'blog-app-registration-v1', 32);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(decoded.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(decoded.at, 'hex'));
      let passwordHash = decipher.update(decoded.eh, 'hex', 'utf8');
      passwordHash += decipher.final('utf8');

      const existing = await prisma.user.findUnique({ where: { email: decoded.email } });
      if (existing) {
        throw new BadRequestError('Email already in use');
      }

      const user = await prisma.user.create({
        data: {
          email: decoded.email,
          name: decoded.name,
          passwordHash,
        },
      });

      // Send welcome email asynchronously since account is now created
      // eslint-disable-next-line no-console
      EmailService.sendWelcome(user.email).catch(console.error);

      const tokens = await TokenService.generateTokenPair(user.id, user.role);
      return { user, tokens };
    } catch (e: any) {
      if (e instanceof BadRequestError) throw e;
      throw new BadRequestError('Invalid or expired verification token');
    }
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) {
      // Dummy compare to prevent timing attacks
      await bcrypt.compare(input.password, '$2b$10$dummyHashThatIs60CharsLong12345678901234567890123');
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await TokenService.generateTokenPair(user.id, user.role);
    return { user, tokens };
  }

  static async refresh(refreshToken: string) {
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const record = await prisma.refreshToken.findUnique({
        where: { token: hashedToken },
        include: { user: true },
      });

      if (!record) {
        throw new Error('Invalid refresh token');
      }

      if (record.revoked) {
        // Token reuse detected - revoke ALL active sessions for this user
        await prisma.refreshToken.updateMany({
          where: { userId: record.userId },
          data: { revoked: true },
        });
        throw new Error('Refresh token reuse detected. All sessions revoked.');
      }

      // Revoke the old token (rotation)
      await prisma.refreshToken.update({
        where: { id: record.id },
        data: { revoked: true },
      });

      // Generate new pair
      const tokens = await TokenService.generateTokenPair(record.userId, record.user.role);
      return tokens;
    } catch (_e) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.update({
        where: { token: hashedToken },
        data: { revoked: true },
      });
    } catch (_e) {
      // Ignore invalid token on logout
    }
  }

  static async googleOAuth(profile: { email: string; name: string; id: string; picture?: string }) {
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatarUrl: profile.picture,
        },
      });
      // eslint-disable-next-line no-console
      EmailService.sendWelcome(user.email).catch(console.error);
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id, avatarUrl: user.avatarUrl || profile.picture },
      });
    }

    const tokens = await TokenService.generateTokenPair(user.id, user.role);
    return { user, tokens };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // S3: Return silently to prevent user enumeration
      return;
    }
    const token = jwt.sign({ userId: user.id, purpose: 'reset', phash: user.passwordHash?.slice(-10) }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    EmailService.sendResetPassword(user.email, token).catch(console.error);
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string, purpose: string, phash?: string };
      if (decoded.purpose !== 'reset') throw new Error('Invalid token purpose');

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new Error('User not found');
      if (decoded.phash && decoded.phash !== user.passwordHash?.slice(-10)) {
        throw new Error('Token has already been used');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash },
      });
    } catch (_e) {
      throw new BadRequestError('Invalid or expired reset token');
    }
  }
}
