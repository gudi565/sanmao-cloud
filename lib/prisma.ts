import { PrismaClient } from "@prisma/client";

/**
 * Prisma 单例：避免 Next dev 的 Fast Refresh 反复实例化 PrismaClient，
 * 导致数据库连接句柄泄漏。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
