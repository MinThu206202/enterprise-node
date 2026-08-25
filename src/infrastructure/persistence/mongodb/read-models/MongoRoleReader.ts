import type { Collection } from "mongodb";

import type { IRoleReader } from "../../../../domain/repositories/IRoleReader.js";

import type { RoleReadModel } from "../../../../application/read-models/roles/RoleReadModel.js";
import { MongoRoleDocument } from "./MongoRoleDocument.js";
import type { MongoDatabase } from "../MongoDatabase.js";

export class MongoRoleReader implements IRoleReader {
  constructor(private readonly database: MongoDatabase) {}

  private get collection(): Collection<MongoRoleDocument> {
    return this.database.collection<MongoRoleDocument>("roles");
  }

  async findById(id: string): Promise<RoleReadModel | null> {
    const document = await this.collection.findOne({
      _id: id,
    });

    if (!document) {
      return null;
    }

    return this.toReadModel(document);
  }

  async findAll(): Promise<RoleReadModel[]> {
    const documents = await this.collection
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return documents.map((document) => this.toReadModel(document));
  }

  async findByNames(names: string[]): Promise<RoleReadModel[]> {
    if (names.length === 0) {
      return [];
    }

    const documents = await this.collection
      .find({
        name: {
          $in: names,
        },
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    return documents.map((document) => this.toReadModel(document));
  }

  private toReadModel(document: MongoRoleDocument): RoleReadModel {
    return {
      id: document.id,
      name: document.name,
      description: document.description,
      permissions: document.permissions,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      version: document.version,
    };
  }
}
