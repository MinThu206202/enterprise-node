import { Permission } from "../../../../domain/entities/Permission.js";
import type { IRolePermissionRepository } from "../../../../domain/repositories/IRolePermissionRepository.js";
import type { PrismaClient } from "../../../../generated/prisma/client.js";
import { PrismaTransaction } from "../PrismaTransaction.js";

export class PrismaRolePermissionRepository implements IRolePermissionRepository {
  constructor(
    private readonly prisma: PrismaClient | PrismaTransaction,
  ) {}

  async assign(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async remove(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  async exists(roleId: string, permissionId: string): Promise<boolean> {
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return rolePermission !== null;
  }

  async findPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rolePermission) =>
      Permission.create({
        id: rolePermission.permission.id,
        name: rolePermission.permission.name,
        description: rolePermission.permission.description,
        createdAt: rolePermission.permission.createdAt,
        updatedAt: rolePermission.permission.updatedAt,
      }),
    );
  }
}
