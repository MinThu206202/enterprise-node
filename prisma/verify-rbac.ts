import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  for (const role of roles) {
    console.log(`\n${role.name}`);

    for (const rolePermission of role.rolePermissions) {
      console.log(`  - ${rolePermission.permission.name}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
