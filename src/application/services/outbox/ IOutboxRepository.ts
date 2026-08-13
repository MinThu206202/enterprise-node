export interface CreateOutboxMessageInput{
  type : string,
  payload : Record<string,unknown>,
  availableAt?: Date
}

export interface IOutboxRepository{
  create(
    input: CreateOutboxMessageInput,
  ): Promise<void>
}