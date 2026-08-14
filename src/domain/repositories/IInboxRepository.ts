export interface IInboxRepository {
  exists(id: string): Promise<boolean>;

  markProcessed(id: string, type: string): Promise<void>;
}
