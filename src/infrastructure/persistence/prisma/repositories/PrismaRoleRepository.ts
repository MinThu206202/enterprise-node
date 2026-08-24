import type { PrismaClient } from "../../../../generated/prisma/client.js";
import type { PrismaTransaction } from "../PrismaTransaction.js";
import { RoleMapper } from "../../../../application/mappers/RoleMapper.js";
import { Role } from "../../../../domain/entities/Role.js";
import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { CreateRoleInput } from "../../../../application/modules/roles/dto/CreateRoleInput.js";
import type { UpdateRoleInput } from "../../../../application/modules/roles/dto/UpdateRoleInput.js";

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction) {}

  async findById(id: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id, deletedAt: null },
    });

    return role ? RoleMapper.toDomain(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name, deletedAt: null },
    });

    return role ? RoleMapper.toDomain(role) : null;
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: {
        createdAt: "desc",
      },
    });

    return roles.map(RoleMapper.toDomain);
  }

  async create(data: CreateRoleInput): Promise<Role> {
    const createdRole = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? "",
      },
    });

    return RoleMapper.toDomain(createdRole);
  }

  async update(id: string, data: UpdateRoleInput): Promise<Role> {
    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description ?? "",
        }),
      },
    });

    return RoleMapper.toDomain(updatedRole);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.role.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
