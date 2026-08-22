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

const permissions = [
  {
    name: "users:create",
    description: "Create users",
  },
  {
    name: "users:read",
    description: "View users",
  },
  {
    name: "users:update",
    description: "Update users",
  },
  {
    name: "users:delete",
    description: "Delete users",
  },
  {
    name: "roles:create",
    description: "Create roles",
  },
  {
    name: "roles:read",
    description: "View roles",
  },
  {
    name: "roles:update",
    description: "Update roles",
  },
  {
    name: "roles:delete",
    description: "Delete roles",
  },
  {
    name: "permissions:read",
    description: "View permissions",
  },
  {
    name: "permissions:assign",
    description: "Assign permissions to roles",
  },
  {
    name: "transfer:create",
    description: "Create transfers",
  },
  {
    name: "transfer:update",
    description: "Update transfers",
  },
  {
    name: "user-roles:read",
    description: "View user role assignments",
  },
  {
    name: "user-roles:assign",
    description: "Assign roles to users",
  },
  {
    name: "user-roles:delete",
    description: "Remove roles from users",
  },
];

const roles = [
  {
    name: "SUPER_ADMIN",
    description: "Full system administrator",
    permissions: permissions.map((permission) => permission.name),
  },

  {
    name: "ADMIN",
    description: "Application administrator",
    permissions: [
      "users:create",
      "users:read",
      "users:update",
      "users:delete",

      "roles:create",
      "roles:read",
      "roles:update",
      "roles:delete",

      "transfer:create",
      "transfer:update",

      "user-roles:read",
      "user-roles:assign",
      "user-roles:delete",

      "permissions:read",
      "permissions:assign",
    ],
  },

  {
    name: "USER",
    description: "Standard application user",
    permissions: ["users:read"],
  },

  {
    name: "AUDITOR",
    description: "Read-only auditing user",
    permissions: ["users:read", "roles:read", "permissions:read"],
  },
];

async function main(): Promise<void> {
  console.log("🌱 Starting RBAC seed...");

  // -----------------------------------------------------
  // Permissions
  // -----------------------------------------------------

  const permissionMap = new Map<string, string>();

  for (const permission of permissions) {
    const createdPermission = await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: {
        name: permission.name,
        description: permission.description,
      },
    });

    permissionMap.set(createdPermission.name, createdPermission.id);
  }

  console.log(`✅ ${permissionMap.size} permissions seeded`);

  // -----------------------------------------------------
  // Roles
  // -----------------------------------------------------

  for (const roleDefinition of roles) {
    const role = await prisma.role.upsert({
      where: {
        name: roleDefinition.name,
      },
      update: {
        description: roleDefinition.description,
      },
      create: {
        name: roleDefinition.name,
        description: roleDefinition.description,
      },
    });

    // ---------------------------------------------------
    // Role permissions
    // ---------------------------------------------------

    for (const permissionName of roleDefinition.permissions) {
      const permissionId = permissionMap.get(permissionName);

      if (!permissionId) {
        throw new Error(`Permission not found: ${permissionName}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId,
        },
      });
    }

    console.log(`✅ Role seeded: ${role.name}`);
  }

  console.log("🌱 RBAC seed completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ RBAC seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
