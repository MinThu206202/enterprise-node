import type { Collection } from "mongodb";

import type { MongoRoleDocument } from "./MongoRoleDocument.js";
import { RoleCreatedEvent, RoleDeletedEvent, RoleUpdatedEvent } from "../../../../application/events/schemas/RoleEvents.js";
import { RolePermissionAssignedEvent, RolePermissionRemovedEvent } from "../../../../application/events/schemas/RolePermissionEvents.js";
import type { MongoDatabase } from "../MongoDatabase.js";

export class MongoRoleProjector {
  constructor(private readonly database: MongoDatabase) {}

  private get collection(): Collection<MongoRoleDocument> {
    return this.database.collection<MongoRoleDocument>("roles");
  }

  async projectRoleCreated(event: RoleCreatedEvent): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.roleId,
      },
      {
        $set: {
          id: payload.roleId,
          name: payload.name,
          description: payload.description,
          version: payload.version,
          updatedAt: new Date(event.occurredAt),
        },

        $setOnInsert: {
          permissions: [],
          createdAt: new Date(event.occurredAt),
        },
      },
      {
        upsert: true,
      },
    );
  }

  async projectRoleUpdated(event: RoleUpdatedEvent): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.roleId,
      },

      {
        $set: {
          id: payload.roleId,
          name: payload.name,
          description: payload.description,
          version: payload.version,
          updatedAt: new Date(event.occurredAt),
        },
      },
    );
  }

  async projectRoleDeleted(event: RoleDeletedEvent): Promise<void> {
    const { payload } = event;

    await this.collection.deleteOne({
      _id: payload.roleId,
    });
  }

  async projectRolePermissionAssigned(
    event: RolePermissionAssignedEvent,
  ): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.roleId,
      },
      {
        $addToSet: {
          permissions: payload.permissionCode,
        },

        $set: {
          updatedAt: new Date(event.occurredAt),
        },
      },
    );
  }

  async projectRolePermissionRemoved(
    event: RolePermissionRemovedEvent,
  ): Promise<void> {
    const { payload } = event;

    await this.collection.updateOne(
      {
        _id: payload.roleId,
      },
      {
        $pull: {
          permissions: payload.permissionCode,
        },

        $set: {
          updatedAt: new Date(event.occurredAt),
        },
      },
    );
  }
}
