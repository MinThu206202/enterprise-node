import type { PrismaClient } from "../../../../generated/prisma/client.js";
import type { PrismaTransaction } from "../PrismaTransaction.js";
import type {
  IOutboxRepository,
  CreateOutboxMessageInput,
} from "../../../../domain/repositories/IOutboxRepository.js";

export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction) {}

  async create(
    input: CreateOutboxMessageInput,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.outboxMessage.create({
      data: {
        type: input.type,
        payload: input.payload as never,
        availableAt: input.availableAt,
      },
    });
  }

  async getPendingMessages(limit: number) {
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

    return messages.map((message) => ({
      id: message.id,
      type: message.type,
      payload: message.payload as Record<string, unknown>,
      status: message.status,
      attempts: message.attempts,
      availableAt: message.availableAt,
      createdAt: message.createdAt,
      processedAt: message.processedAt,
    }));
  }

  async markProcessing(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: {
        status: "PROCESSING",
      },
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        processedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, nextAvailableAt: Date): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
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
      where: { id },
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
