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
}
