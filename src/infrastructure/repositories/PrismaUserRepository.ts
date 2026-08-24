import type { PrismaClient } from "../../generated/prisma/client.js";
import { User } from "../../domain/entities/User.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { PrismaTransaction } from "../database/PrismaTransaction.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        version: user.version,
        passwordHash: user.getPasswordHash(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      },
    });

    return this.toDomain(record);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });
  }

  private toDomain(record: {
    id: string;
    email: string;
    name: string;
    version: number;
    passwordHash: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    if (!record.passwordHash) {
      throw new Error(`User ${record.id} does not have a password hash`);
    }

    return new User({
      id: record.id,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}
