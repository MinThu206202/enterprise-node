import type { PrismaClient } from "../../generated/prisma/client.js";
import { User } from "../../domain/entities/User.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: {
        id,
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
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.user.upsert({
      where: {
        id: user.getId(),
      },

      create: {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        passwordHash: user.getPasswordHash(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      },

      update: {
        email: user.getEmail(),
        name: user.getName(),
        passwordHash: user.getPasswordHash(),
        updatedAt: user.getUpdatedAt(),
      },
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  private toDomain(record: {
    id: string;
    email: string;
    name: string;
    passwordHash: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    if (!record.passwordHash) {
      throw new Error(`User ${record.id} does not have a password hash`);
    }

    return new User({
      id: record.id,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
