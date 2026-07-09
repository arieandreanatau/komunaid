export { PrismaClient } from "@prisma/client";
export type * from "@prisma/client";

import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Execute a database transaction.
 * Use this for operations that need atomicity.
 */
export async function transaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

/**
 * Execute a interactive transaction with custom timeout.
 * Use this for long-running transactions.
 */
export async function interactiveTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  timeout?: number
): Promise<T> {
  return prisma.$transaction(fn, { maxWait: timeout || 10000, timeout: timeout || 30000 });
}
