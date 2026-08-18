export interface CreateOutboxMessageInput {
  type: string;
  payload: Record<string, unknown>;
  availableAt?: Date;
}

export interface OutboxMessage {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  availableAt: Date;
  createdAt: Date;
  processedAt: Date | null;
}

export interface IOutboxRepository {
  create(input: CreateOutboxMessageInput, tx?: unknown): Promise<void>;

  getPendingMessages(limit: number): Promise<OutboxMessage[]>;

  markProcessing(id: string): Promise<void>;

  markPublished(id: string): Promise<void>;

  markFailed(id: string, nextAvailableAt: Date): Promise<void>;

  markPermanentlyFailed(id: string): Promise<void>;
}
