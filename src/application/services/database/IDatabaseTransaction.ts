export interface IDatabaseTransaction {
  execute<T>(callback: (tx: unknown) => Promise<T>): Promise<T>;
}
