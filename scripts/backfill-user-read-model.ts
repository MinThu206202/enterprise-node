import "dotenv/config";

import { MongoClient } from "mongodb";

import { prisma } from "../src/infrastructure/persistence/prisma/PrismaClient.js";

const MONGODB_URL = process.env.MONGODB_URL ?? "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB ?? "enterprise_read";

async function main(): Promise<void> {
  const mongo = new MongoClient(MONGODB_URL);

  await mongo.connect();

  const collection = mongo.db(MONGODB_DB).collection("users");

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  let upserted = 0;

  for (const user of users) {
    const roles: string[] = [];

    const permissions = new Set<string>();

    for (const userRole of user.userRoles) {
      if (userRole.role.deletedAt !== null) {
        continue;
      }

      roles.push(userRole.role.name);

      for (const rolePermission of userRole.role.rolePermissions) {
        permissions.add(rolePermission.permission.name);
      }
    }

    await collection.updateOne(
      {
        _id: user.id,
      },
      {
        $set: {
          id: user.id,
          email: user.email,
          name: user.name,
          version: user.version,
          roles,
          permissions: [...permissions],
          updatedAt: user.updatedAt,
        },
        $setOnInsert: {
          createdAt: user.createdAt,
        },
      },
      {
        upsert: true,
      },
    );

    upserted += 1;
  }

  console.log(
    `Backfill complete. Postgres users: ${users.length}, projected: ${upserted}, Mongo total: ${await collection.countDocuments()}`,
  );

  await mongo.close();

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Backfill failed:", error);

  process.exit(1);
});
