import type { PrismaClient } from "../../generated/prisma/client.js";

import { Permission } from "../../domain/entities/Permission.js";

import type { IPermissionRepository } from "../../domain/repositories/IPermissionRepository.js";

export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(permission: Permission): Promise<Permission> {
    const createdPermission = await this.prisma.permission.create({
      data: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      },
    });

    return Permission.create({
      id: createdPermission.id,
      name: createdPermission.name,
      description: createdPermission.description,
      createdAt: createdPermission.createdAt,
      updatedAt: createdPermission.updatedAt,
    });
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return null;
    }

    return Permission.create({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    });
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });

    if (!permission) {
      return null;
    }

    return Permission.create({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    });
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return permissions.map((permission) =>
      Permission.create({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      }),
    );
  }

  async update(permission: Permission): Promise<Permission> {
    const updatedPermission = await this.prisma.permission.update({
      where: {
        id: permission.id,
      },
      data: {
        name: permission.name,
        description: permission.description,
        updatedAt: permission.updatedAt,
      },
    });

    return Permission.create({
      id: updatedPermission.id,
      name: updatedPermission.name,
      description: updatedPermission.description,
      createdAt: updatedPermission.createdAt,
      updatedAt: updatedPermission.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }
}
