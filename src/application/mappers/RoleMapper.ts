import type { Role as PrismaRole } from "../../generated/prisma/client.js";
import { Role } from "../../domain/entities/Role.js";

export class RoleMapper {
  static toDomain(data: PrismaRole): Role {
    return Role.create({
      id: data.id,
      name: data.name,
      version: data.version,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });
  }

  static toPersistence(role: Role) {
    return {
      id: role.id,
      name: role.name,
      version: role.version,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt,
    };
  }
}
