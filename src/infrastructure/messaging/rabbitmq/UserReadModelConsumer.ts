import type { IInboxRepository } from "../../../domain/repositories/IInboxRepository.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

import { EVENT_TYPES } from "../../../application/events/EventTypes.js";

import { MongoUserProjector } from "../../read-models/mongodb/MongoUserProjector.js";

import { rabbitmqClient } from "./rabbitmqClient.js";
import {
  userDeletedEventSchema,
  userRegisteredEventSchema,
  userUpdatedEventSchema,
} from "../../../application/events/schemas/UserEvents.js";
import {
  userRoleAssignedEventSchema,
  userRoleRemovedEventSchema,
} from "../../../application/events/schemas/UserRoleEvents.js";

const EVENTS_EXCHANGE = "enterprise.events";

const USER_READ_MODEL_QUEUE = "enterprise.read-model.users";

export class UserReadModelConsumer {
  constructor(
    private readonly rabbitMQClient: rabbitmqClient,
    private readonly projector: MongoUserProjector,
    private readonly inboxRepository: IInboxRepository,
    private readonly logger: ILogger,
  ) {}

  async start(): Promise<void> {
    const channel = this.rabbitMQClient.getChannel();

    // -----------------------------------------
    // Exchange
    // -----------------------------------------

    await channel.assertExchange(EVENTS_EXCHANGE, "topic", {
      durable: true,
    });

    // -----------------------------------------
    // Queue
    // -----------------------------------------

    await channel.assertQueue(USER_READ_MODEL_QUEUE, {
      durable: true,
    });

    // -----------------------------------------
    // Bind user events
    // -----------------------------------------

    await channel.bindQueue(USER_READ_MODEL_QUEUE, EVENTS_EXCHANGE, "user.*");

    // -----------------------------------------
    // Start consumer
    // -----------------------------------------

    await channel.consume(
      USER_READ_MODEL_QUEUE,
      async (message) => {
        if (!message) {
          return;
        }

        try {
          const messageId = message.properties.messageId;

          if (!messageId) {
            throw new Error("RabbitMQ message is missing messageId");
          }

          // -----------------------------------------
          // Idempotency
          // -----------------------------------------

          const alreadyProcessed = await this.inboxRepository.exists(messageId);

          if (alreadyProcessed) {
            this.logger.info("Duplicate read-model message ignored", {
              messageId,
            });

            channel.ack(message);

            return;
          }

          // -----------------------------------------
          // Parse event
          // -----------------------------------------

          const eventType =
            message.properties.type ?? message.fields.routingKey;

          const rawEvent = JSON.parse(message.content.toString());

          // -----------------------------------------
          // USER REGISTERED
          // -----------------------------------------

          if (eventType === EVENT_TYPES.USER_REGISTERED) {
            const event = userRegisteredEventSchema.parse(rawEvent);

            await this.projector.projectUserRegistered(event);
          }

          // -----------------------------------------
          // USER UPDATED
          // -----------------------------------------
          else if (eventType === EVENT_TYPES.USER_UPDATED) {
            const event = userUpdatedEventSchema.parse(rawEvent);

            await this.projector.projectUserUpdated(event);
          }

          // -----------------------------------------
          // USER DELETED
          // -----------------------------------------
          else if (eventType === EVENT_TYPES.USER_DELETED) {
            const event = userDeletedEventSchema.parse(rawEvent);

            await this.projector.projectUserDeleted(event);
          }

          // -----------------------------------------
          // USER ROLE ASSIGNED / REMOVED
          // -----------------------------------------

          else if (eventType === EVENT_TYPES.USER_ROLE_ASSIGNED) {
            const event = userRoleAssignedEventSchema.parse(rawEvent);

            await this.projector.projectUserRoleAssigned(event);
          } else if (eventType === EVENT_TYPES.USER_ROLE_REMOVED) {
            const event = userRoleRemovedEventSchema.parse(rawEvent);

            await this.projector.projectUserRoleRemoved(event);
          }

          // -----------------------------------------
          // Unknown user event
          // -----------------------------------------

          else {
            this.logger.warn("Unknown user event received", {
              messageId,
              eventType,
            });

            channel.ack(message);

            return;
          }

          // -----------------------------------------
          // Mark processed
          // -----------------------------------------

          await this.inboxRepository.markProcessed(messageId, eventType);

          // -----------------------------------------
          // ACK
          // -----------------------------------------

          channel.ack(message);

          this.logger.info("User read model updated", {
            messageId,
            eventType,
          });
        } catch (error) {
          this.logger.error("Failed to process user read-model event", {
            error,
          });

          // Do not requeue yet.
          //
          // Later we can add:
          // retry → DLQ → permanent failure
          channel.nack(message, false, false);
        }
      },
      {
        noAck: false,
      },
    );

    this.logger.info("User read-model consumer started", {
      queue: USER_READ_MODEL_QUEUE,
    });
  }
}
