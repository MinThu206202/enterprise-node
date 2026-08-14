import type { PrismaClient } from "../../generated/prisma/client.js";
import type { IInboxRepository } from "../../domain/repositories/IInboxRepository.js";

export class PrismaInboxRepository implements IInboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exists(id: string): Promise<boolean> {
    const message = await this.prisma.inboxMessage.findUnique({
      where: {
        id,
      },
    });

    return message !== null;
  }

  async markProcessed(id: string, type: string): Promise<void> {
    await this.prisma.inboxMessage.create({
      data: {
        id,
        type,
      },
    });
  }
}
