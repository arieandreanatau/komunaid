import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    ...(process.env.VERCEL
      ? {
          transactionOptions: {
            maxWait: 10000,
            timeout: 30000,
          },
        }
      : {}),
  });

  const protectedClient = client.$extends({
    query: {
      auditLog: {
        update({ args, query }) {
          throw new Error("Audit log immutability violation: update is not allowed");
        },
        delete({ args, query }) {
          throw new Error("Audit log immutability violation: delete is not allowed");
        },
        updateMany({ args, query }) {
          throw new Error("Audit log immutability violation: updateMany is not allowed");
        },
        deleteMany({ args, query }) {
          throw new Error("Audit log immutability violation: deleteMany is not allowed");
        },
        upsert({ args, query }) {
          throw new Error("Audit log immutability violation: upsert is not allowed");
        },
      },
    },
  });

  return protectedClient as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

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
