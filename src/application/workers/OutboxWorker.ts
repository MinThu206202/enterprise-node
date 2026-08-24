import type { IOutboxRepository } from "../../domain/repositories/IOutboxRepository.js";
import type { ILogger } from "../../shared/logging/ILogger.js";
import { IMessagePublisher } from "../ports/messaging/IMessagePublisher.js";

export class OutboxWorker {
  private running = false;
  private getRetryDelay(attempts: number): number {
    const delays = [
      5_000, // 5 seconds
      30_000, // 30 seconds
      120_000, // 2 minutes
      180_000, // 10 minutes
    ];

    return delays[Math.min(attempts, delays.length - 1)];
  }

  constructor(
    private readonly outboxRepository: IOutboxRepository,
    private readonly logger: ILogger,
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    this.logger.info("Outbox worker started");

    while (this.running) {
      try {
        await this.processBatch();
      } catch (error) {
        this.logger.error("Outbox worker error", {
          error,
        });
      }

      await this.sleep(1000);
    }
  }

  stop(): void {
    this.running = false;

    this.logger.info("Outbox worker stop");
  }

  private async processBatch(): Promise<void> {
    const messages = await this.outboxRepository.getPendingMessages(10);

    if (messages.length === 0) {
      return;
    }

    for (const message of messages) {
      try {
        this.logger.info("Processing outbox message", {
          messageId: message.id,
          type: message.type,
        });

        await this.outboxRepository.markProcessing(message.id);

        await this.messagePublisher.publish(
          message.id,
          message.type,
          message.payload,
        );

        await this.outboxRepository.markPublished(message.id);

        this.logger.info("Outbox message published", {
          messageId: message.id,
          type: message.type,
        });
      } catch (error) {
        const nextAttempt = message.attempts + 1;

        if (nextAttempt >= 5) {
          this.logger.error("Outbox message permanently failed", {
            messageId: message.id,
            type: message.type,
            attempts: nextAttempt,
            error,
          });

          await this.outboxRepository.markPermanentlyFailed(message.id);

          continue;
        }

        const delay = this.getRetryDelay(message.attempts);

        const nextAvailableAt = new Date(Date.now() + delay);

        await this.outboxRepository.markFailed(message.id, nextAvailableAt);

        this.logger.warn("Outbox message scheduled for retry", {
          messageId: message.id,
          type: message.type,
          attempts: nextAttempt,
          nextAvailableAt,
        });
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
