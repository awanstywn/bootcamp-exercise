/**
 * @fileoverview Password hashing and verification utilities.
 * @objective To securely hash user passwords before database storage and verify plain-text passwords against their hashed counterparts.
 * @logic
 * 1. `hashPassword`: Uses `bcryptjs` with a defined salt rounds configuration to generate a secure, irreversible hash of a plain-text password.
 * 2. `comparePassword`: Compares a provided plain-text password with a stored hash to verify authenticity during the login process.
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
