/**
 * @fileoverview JSON Web Token (JWT) utility functions.
 * @objective To handle the creation, verification, and decoding of JWTs for user authentication and session management.
 * @logic
 * 1. `generateToken`: Signs a new JWT with a payload (userId, email) using a secret key and sets an expiration time.
 * 2. `verifyToken`: Validates a given token against the secret key, ensuring it hasn't been tampered with or expired, and returns the decoded payload.
 * 3. `decodeToken`: Safely extracts the token payload without verifying the signature, useful for client-side or non-critical data extraction.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || 'default-secret-change-in-production') as string | Buffer;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};
