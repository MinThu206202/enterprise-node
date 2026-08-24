import type { IEmailService } from "../../../application/ports/registration/IEmailService.js";
import type { IInboxRepository } from "../../../domain/repositories/IInboxRepository.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";
import { rabbitmqClient } from "./rabbitmqClient.js";

const EVENTS_EXCHANGE = "enterprise.events";
const EMAIL_QUEUE = "enterprise.email";
const USER_REGISTERED_ROUTING_KEY = "user.registered";

const EMAIL_DLQ_EXCHANGE = "enterprise.email.dlx";
const EMAIL_DLQ_QUEUE = "enterprise.email.dlq";
const EMAIL_DLQ_ROUTING_KEY = "email.failed";

interface UserRegisteredMessage {
  userId: string;
  email: string;
  name: string;
}

export class WelcomeEmailConsumer {
  constructor(
    private readonly rabbitMQClient: rabbitmqClient,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
    private readonly inboxRepository: IInboxRepository,
  ) {}

  async start(): Promise<void> {
    const channel = this.rabbitMQClient.getChannel();

    // -----------------------------------------
    // Main exchange
    // -----------------------------------------

    await channel.assertExchange(EVENTS_EXCHANGE, "topic", {
      durable: true,
    });

    // -----------------------------------------
    // DLQ exchange
    // -----------------------------------------

    await channel.assertExchange(EMAIL_DLQ_EXCHANGE, "direct", {
      durable: true,
    });

    // -----------------------------------------
    // DLQ queue
    // -----------------------------------------

    await channel.assertQueue(EMAIL_DLQ_QUEUE, {
      durable: true,
    });

    // -----------------------------------------
    // Bind DLQ
    // -----------------------------------------

    await channel.bindQueue(
      EMAIL_DLQ_QUEUE,
      EMAIL_DLQ_EXCHANGE,
      EMAIL_DLQ_ROUTING_KEY,
    );

    // -----------------------------------------
    // Main email queue
    // -----------------------------------------

    await channel.assertQueue(EMAIL_QUEUE, {
      durable: true,

      deadLetterExchange: EMAIL_DLQ_EXCHANGE,

      deadLetterRoutingKey: EMAIL_DLQ_ROUTING_KEY,
    });

    // -----------------------------------------
    // Bind main queue
    // -----------------------------------------

    await channel.bindQueue(
      EMAIL_QUEUE,
      EVENTS_EXCHANGE,
      USER_REGISTERED_ROUTING_KEY,
    );

    // -----------------------------------------
    // Start consumer
    // -----------------------------------------

    await channel.consume(
      EMAIL_QUEUE,
      async (incomingMessage) => {
        if (!incomingMessage) {
          return;
        }

        // Important:
        // Keep a non-null reference so TypeScript knows
        // this message cannot become null.
        const message = incomingMessage;

        try {
          // -----------------------------------------
          // Message ID
          // -----------------------------------------

          const messageId = message.properties.messageId;

          if (!messageId) {
            throw new Error("RabbitMQ message is missing messageId");
          }

          // -----------------------------------------
          // Inbox / idempotency check
          // -----------------------------------------

          const alreadyProcessed = await this.inboxRepository.exists(messageId);

          if (alreadyProcessed) {
            this.logger.info("Duplicate message ignored", {
              messageId,
            });

            channel.ack(message);

            return;
          }

          // -----------------------------------------
          // Parse payload
          // -----------------------------------------

          const payload = JSON.parse(
            message.content.toString(),
          ) as UserRegisteredMessage;

          // -----------------------------------------
          // Log received event
          // -----------------------------------------

          this.logger.info("Received user.registered event", {
            messageId,
            userId: payload.userId,
            email: payload.email,
          });

          // -----------------------------------------
          // Send email
          // -----------------------------------------

          await this.emailService.sendWelcomeEmail(payload.email, payload.name);

          // -----------------------------------------
          // Mark message as processed
          // -----------------------------------------

          await this.inboxRepository.markProcessed(
            messageId,
            message.properties.type ?? USER_REGISTERED_ROUTING_KEY,
          );

          // -----------------------------------------
          // ACK
          // -----------------------------------------

          channel.ack(message);

          this.logger.info("Welcome email sent successfully", {
            messageId,
            userId: payload.userId,
            email: payload.email,
          });
        } catch (error) {
          console.error("========== WELCOME EMAIL ERROR ==========");

          console.error(error);

          if (error instanceof Error) {
            console.error("name:", error.name);
            console.error("message:", error.message);
            console.error("stack:", error.stack);
          }

          console.error("=========================================");

          this.logger.error("Failed to process welcome email");

          channel.nack(message, false, false);
        }
      },
      {
        noAck: false,
      },
    );

    this.logger.info("Welcome email consumer started", {
      queue: EMAIL_QUEUE,
    });
  }
}
