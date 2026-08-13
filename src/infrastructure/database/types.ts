import type { PrismaClient } from "../../generated/prisma/client.js";

export type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];