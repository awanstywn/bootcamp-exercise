/**
 * @file prisma.ts
 * @description Utility/Module for the Server (Backend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for prisma operations.
 * 
 * @relations
 * Interacts with: @prisma/client, @prisma/adapter-pg, pg.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
