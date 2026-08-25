import type { Collection } from "mongodb";

import type { IPermissionReader } from "../../../../domain/repositories/IPermissionReader.js";

import type { PermissionReadModel } from "../../../../application/read-models/permissions/PermissionReadModel.js";
import { MongoPermissionDocument } from "./MongoPermissionDocument.js";
import type { MongoDatabase } from "../MongoDatabase.js";

export class MongoPermissionReader implements IPermissionReader {
  constructor(private readonly database: MongoDatabase) {}

  private get collection(): Collection<MongoPermissionDocument> {
    return this.database.collection<MongoPermissionDocument>("permissions");
  }

  async findAll(): Promise<PermissionReadModel[]> {
    const documents = await this.collection
      .find({})
      .sort({
        name: 1,
      })
      .toArray();

    return documents.map((document) => this.toReadModel(document));
  }

  async findByNames(names: string[]): Promise<PermissionReadModel[]> {
    if (names.length === 0) {
      return [];
    }

    const documents = await this.collection
      .find({
        _id: {
          $in: names,
        },
      })
      .sort({
        name: 1,
      })
      .toArray();

    return documents.map((document) => this.toReadModel(document));
  }

  private toReadModel(document: MongoPermissionDocument): PermissionReadModel {
    return {
      id: document.id,
      name: document.name,
      description: document.description ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
