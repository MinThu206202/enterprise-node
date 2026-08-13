import { PrismaClient } from "@prisma/client/extension";
import { PrismaTransaction } from "../database/PrismaTransaction.js";
import { IOutboxRepository } from "../../domain/repositories/IOutboxRepository.js";
import { CreateOutboxMessageInput } from "../../application/services/outbox/ IOutboxRepository.js";

type PrismaDatabase = PrismaClient | PrismaTransaction;

export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaClient | PrismaTransaction,) {}

  async create(input: CreateOutboxMessageInput): Promise<void> {
    await this.prisma.outboxMessage.create({
      data: {
        type: input.type,
        payload: input.payload,
      },
    });
  }
}
