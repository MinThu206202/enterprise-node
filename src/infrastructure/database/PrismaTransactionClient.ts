import type { PrismaClient } from "../../generated/prisma/client.js";

export type PrismaTransactionClient = Parameters<
  PrismaClient["$transaction"]
>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;
