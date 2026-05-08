/**
 * @fileoverview Prisma database client configuration and initialization.
 * @objective To establish and export a singleton Prisma Client instance connected to the PostgreSQL database via pgBouncer.
 * @logic
 * 1. Configures a connection pool using `pg` to handle database connections efficiently.
 * 2. Initializes `PrismaPg` adapter to enable Prisma to work with the custom connection pool.
 * 3. Implements a singleton pattern (storing the instance in `global.prisma` in development mode) to prevent connection exhaustion during hot reloading.
 * 4. Configures logging based on the environment (detailed logging in development, error-only in production).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
