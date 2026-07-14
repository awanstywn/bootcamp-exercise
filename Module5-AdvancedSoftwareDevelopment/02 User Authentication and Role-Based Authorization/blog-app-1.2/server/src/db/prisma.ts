/**
 * @fileoverview Prisma Client Singleton
 * @objective Instantiate and export a single, shared instance of the Prisma Client to avoid connection exhaustion.
 * @risk Re-instantiating the Prisma Client multiple times (e.g. during hot-reloads) can overwhelm the database with too many connections.
 * @relations Required by all services that need to interact with the database.
 * @logic
 * - Creates a new instance of `PrismaClient` and exports it globally.
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env.js';

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
