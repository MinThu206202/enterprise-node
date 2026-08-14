export interface CreateOutboxMessageInput {
  type: string;
  payload: unknown;
}

export interface OutboxMessage {
  id: string;
  type: string;
  payload: unknown;
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
