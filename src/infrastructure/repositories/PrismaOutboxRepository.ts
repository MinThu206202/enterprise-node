import { PrismaClient } from "@prisma/client/extension";
import { CreateOutboxMessageInput, IOutboxRepository } from "../../application/services/outbox/ IOutboxRepository.js";

export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

    async create(input: CreateOutboxMessageInput): Promise<void> {
        await this.prisma.outboxMessage.create({
            data : {
                type : input.type,
                payload : input.payload,
                availableAt : input.availableAt ?? new Date(),
            }
        })
    }

}
