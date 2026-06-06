/**
 * @fileoverview Prisma client instantiation and database connection configuration.
 * 
 * Relations:
 * - Consumes: `@prisma/client`, `pg` (PostgreSQL driver), and `@prisma/adapter-pg`.
 * - Used by: All service layer files (`*.service.ts`) to interact with the database.
 * 
 * Logic:
 * - Instantiates a single Prisma Client using the native `pg` driver adapter.
 * - Caches the instance on the `global` object during development to prevent connection exhaustion 
 *   caused by hot-reloading (a common issue in Node.js dev environments).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
