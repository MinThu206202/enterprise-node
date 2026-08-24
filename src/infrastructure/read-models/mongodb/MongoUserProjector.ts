import type { Collection } from "mongodb";

import type { MongoUserDocument } from "./MongoUserDocument.js";
import { UserDeletedEvent, UserRegisteredEvent, UserUpdatedEvent } from "../../../application/events/schemas/UserEvents.js";
import { UserRoleAssignedEvent, UserRoleRemovedEvent } from "../../../application/events/schemas/UserRoleEvents.js";
import type { MongoDatabase } from "../../database/mongodb/MongoDatabase.js";

export class MongoUserProjector {
  constructor(private readonly database: MongoDatabase) {}

  private get collection(): Collection<MongoUserDocument> {
    return this.database.collection<MongoUserDocument>("users");
  }

  async projectUserRegistered(event: UserRegisteredEvent): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.userId,
      },
      {
        $set: {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          version: payload.version,
          updatedAt: new Date(event.occurredAt),
        },

        $setOnInsert: {
          roles: [],
          permissions: [],
          createdAt: new Date(event.occurredAt),
        },
      },
      {
        upsert: true,
      },
    );
  }

  async projectUserUpdated(event: UserUpdatedEvent): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.userId,
      },

      {
        $set: {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          version: payload.version,
          updatedAt: new Date(event.occurredAt),
        },
      },
    );
  }

  async projectUserRoleAssigned(event: UserRoleAssignedEvent): Promise<void> {
    await this.applyAuthorizationSnapshot(event);
  }

  async projectUserRoleRemoved(event: UserRoleRemovedEvent): Promise<void> {
    await this.applyAuthorizationSnapshot(event);
  }

  private async applyAuthorizationSnapshot(
    event: UserRoleAssignedEvent | UserRoleRemovedEvent,
  ): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.userId,
      },
      {
        $set: {
          roles: payload.roles,
          permissions: payload.permissions,
          version: event.aggregateVersion,
          updatedAt: new Date(event.occurredAt),
        },
      },
    );
  }

  async projectUserDeleted(event: UserDeletedEvent): Promise<void> {
    const { payload } = event;

    await this.collection.deleteOne({
      _id: payload.userId,
    });
  }
}
