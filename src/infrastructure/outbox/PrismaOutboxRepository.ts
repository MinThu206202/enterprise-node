import { PrismaClient } from "@prisma/client/extension";
import { PrismaTransaction } from "../database/PrismaTransaction.js";
import { IOutboxRepository } from "../../domain/repositories/IOutboxRepository.js";
import { CreateOutboxMessageInput } from "../../application/services/outbox/ IOutboxRepository.js";
import { OutboxMessage } from "../../generated/prisma/client.js";

export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction) {}

  async create(input: CreateOutboxMessageInput): Promise<void> {
    await this.prisma.outboxMessage.create({
      data: {
        type: input.type,
        payload: input.payload,
      },
    });
  }

  async getPendingMessages(limit: number): Promise<OutboxMessage[]> {
    const messages = await this.prisma.outboxMessage.findMany({
      where: {
        status: "PENDING",
        availableAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    return messages.map((message: OutboxMessage) => ({
      id: message.id,
      type: message.type,
      payload: message.payload,
      status: message.status,
      attempts: message.attempts,
      availableAt: message.availableAt,
      createdAt: message.createdAt,
      processedAt: message.processedAt,
    }));
  }

  async markProcessing(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: {
        id,
      },
      data: {
        status: "PROCESSING",
      },
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: {
        id,
      },
      data: {
        status: "PUBLISHED",
        processedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, nextAvailableAt: Date): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: {
        id,
      },
      data: {
        status: "PENDING",
        availableAt: nextAvailableAt,
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async markPermanentlyFailed(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: {
        id,
      },
      data: {
        status: "FAILED",
        attempts: {
          increment: 1,
        },
        processedAt: new Date(),
      },
    });
  }
}
