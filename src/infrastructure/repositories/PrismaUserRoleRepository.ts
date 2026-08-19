import type { PrismaClient } from "../../generated/prisma/client.js";
import type { PrismaTransaction } from "../database/PrismaTransaction.js";
import type { IUserRoleRepository } from "../../domain/repositories/IUserRoleRepository.js";

export class PrismaUserRoleRepository implements IUserRoleRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction) {}

  async create(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async findByUserId(userId: string): Promise<{ roleId: string }[]> {
    return this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });
  }
}
