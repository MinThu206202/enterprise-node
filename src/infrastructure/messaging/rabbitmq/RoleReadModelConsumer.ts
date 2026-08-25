import type { IInboxRepository } from "../../../domain/repositories/IInboxRepository.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";

import { EVENT_TYPES } from "../../../application/events/EventTypes.js";

import { MongoRoleProjector } from "../../persistence/mongodb/read-models/MongoRoleProjector.js";

import { rabbitmqClient } from "./rabbitmqClient.js";
import {
  roleCreatedEventSchema,
  roleDeletedEventSchema,
  roleUpdatedEventSchema,
} from "../../../application/events/schemas/RoleEvents.js";
import {
  rolePermissionAssignedEventSchema,
  rolePermissionRemovedEventSchema,
} from "../../../application/events/schemas/RolePermissionEvents.js";

const EVENTS_EXCHANGE = "enterprise.events";

const ROLE_READ_MODEL_QUEUE = "enterprise.read-model.roles";

export class RoleReadModelConsumer {
  constructor(
    private readonly rabbitMQClient: rabbitmqClient,
    private readonly projector: MongoRoleProjector,
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

    await channel.assertQueue(ROLE_READ_MODEL_QUEUE, {
      durable: true,
    });

    // -----------------------------------------
    // Bind role events
    // -----------------------------------------

    await channel.bindQueue(ROLE_READ_MODEL_QUEUE, EVENTS_EXCHANGE, "role.*");

    // -----------------------------------------
    // Start consumer
    // -----------------------------------------

    await channel.consume(
      ROLE_READ_MODEL_QUEUE,
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
          // ROLE CREATED
          // -----------------------------------------

          if (eventType === EVENT_TYPES.ROLE_CREATED) {
            const event = roleCreatedEventSchema.parse(rawEvent);

            await this.projector.projectRoleCreated(event);
          }

          // -----------------------------------------
          // ROLE UPDATED
          // -----------------------------------------
          else if (eventType === EVENT_TYPES.ROLE_UPDATED) {
            const event = roleUpdatedEventSchema.parse(rawEvent);

            await this.projector.projectRoleUpdated(event);
          }

          // -----------------------------------------
          // ROLE DELETED
          // -----------------------------------------
          else if (eventType === EVENT_TYPES.ROLE_DELETED) {
            const event = roleDeletedEventSchema.parse(rawEvent);

            await this.projector.projectRoleDeleted(event);
          }

          // -----------------------------------------
          // ROLE PERMISSION ASSIGNED / REMOVED
          // -----------------------------------------

          else if (eventType === EVENT_TYPES.ROLE_PERMISSION_ASSIGNED) {
            const event = rolePermissionAssignedEventSchema.parse(rawEvent);

            await this.projector.projectRolePermissionAssigned(event);
          } else if (eventType === EVENT_TYPES.ROLE_PERMISSION_REMOVED) {
            const event = rolePermissionRemovedEventSchema.parse(rawEvent);

            await this.projector.projectRolePermissionRemoved(event);
          }

          // -----------------------------------------
          // Unknown role event
          // -----------------------------------------

          else {
            this.logger.warn("Unknown role event received", {
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

          this.logger.info("Role read model updated", {
            messageId,
            eventType,
          });
        } catch (error) {
          this.logger.error("Failed to process role read-model event", {
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

    this.logger.info("Role read-model consumer started", {
      queue: ROLE_READ_MODEL_QUEUE,
    });
  }
}
