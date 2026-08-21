import type { PrismaClient } from "../../generated/prisma/client.js";
import type { PrismaTransaction } from "../database/PrismaTransaction.js";
import type { IUserRoleRepository } from "../../domain/repositories/IUserRoleRepository.js";

export class PrismaUserRoleRepository implements IUserRoleRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction) {}

  async assign(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async remove(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async exists(userId: string, roleId: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return userRole !== null;
  }

  async findRolesByUserId(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
      },
      select: {
        roleId: true,
      },
    });

    return userRoles.map((userRole) => userRole.roleId);
  }

  async findUserIdsByRoleId(roleId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        roleId,
      },
      select: {
        userId: true,
      },
    });

    return userRoles.map((userRole) => userRole.userId);
  }
}
