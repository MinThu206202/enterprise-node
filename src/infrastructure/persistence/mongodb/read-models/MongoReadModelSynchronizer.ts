import type { MongoDatabase } from "../MongoDatabase.js";
import type { PrismaClient } from "../../../../generated/prisma/client.js";

interface RolePermissionRow {
  permission: {
    name: string;
  };
}

export class MongoReadModelSynchronizer {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly database: MongoDatabase,
  ) {}

  async synchronize(): Promise<void> {
    const users = await this.prisma.user.findMany({
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

    const roles = await this.prisma.role.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const rolesCollection = this.database.collection<{
      _id: string;
    }>("roles");

    for (const role of roles) {
      const permissions = (
        role.rolePermissions as unknown as RolePermissionRow[]
      ).map((row) => row.permission.name);

      await rolesCollection.updateOne(
        {
          _id: role.id,
        },
        {
          $set: {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions,
            version: role.version,
            updatedAt: role.updatedAt,
          },
          $setOnInsert: {
            createdAt: role.createdAt,
          },
        },
        {
          upsert: true,
        },
      );
    }

    const permissionsCollection = this.database.collection<{
      _id: string;
    }>("permissions");

    const permissions = await this.prisma.permission.findMany();

    for (const permission of permissions) {
      await permissionsCollection.updateOne(
        {
          _id: permission.name,
        },
        {
          $set: {
            id: permission.id,
            name: permission.name,
            description: permission.description,
            updatedAt: permission.updatedAt,
          },
          $setOnInsert: {
            createdAt: permission.createdAt,
          },
        },
        {
          upsert: true,
        },
      );
    }

    const usersCollection = this.database.collection<{
      _id: string;
    }>("users");

    for (const user of users) {
      const roleNames: string[] = [];

      const permissions = new Set<string>();

      for (const userRole of user.userRoles) {
        if (userRole.role.deletedAt !== null) {
          continue;
        }

        roleNames.push(userRole.role.name);

        for (const rolePermission of userRole.role
          .rolePermissions as unknown as RolePermissionRow[]) {
          permissions.add(rolePermission.permission.name);
        }
      }

      await usersCollection.updateOne(
        {
          _id: user.id,
        },
        {
          $set: {
            id: user.id,
            email: user.email,
            name: user.name,
            version: user.version,
            roles: roleNames,
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
    }
  }
}
