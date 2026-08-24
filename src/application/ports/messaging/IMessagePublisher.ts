export interface IMessagePublisher {
  publish(messageId: string, type: string, payload: unknown): Promise<void>;
}
