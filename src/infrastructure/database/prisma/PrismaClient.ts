import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { APP_TIME_ZONE } from "../../../shared/time/AppTimeZone.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const connectionStringWithTimeZone = (() => {
  const url = new URL(connectionString);

  url.searchParams.set("options", `-c timezone=${APP_TIME_ZONE}`);

  return url.toString();
})();

const adapter = new PrismaPg({
  connectionString: connectionStringWithTimeZone,
});

export const prisma = new PrismaClient({
  adapter,
});
