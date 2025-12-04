import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "@/generated/client/client";

const globalForPrisma = globalThis as unknown as { prismaClientV2: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prismaClientV2 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClientV2 = prisma;
