import type { Collection } from "mongodb";

import type { IUserReader } from "../../../../domain/repositories/IUserReader.js";

import type { UserReadModel } from "../../../../application/read-models/users/UserReadModel.js";
import { MongoUserDocument } from "./MongoUserDocument.js";
import type { MongoDatabase } from "../MongoDatabase.js";

export class MongoUserReader implements IUserReader {
  constructor(private readonly database: MongoDatabase) {}

  private get collection(): Collection<MongoUserDocument> {
    return this.database.collection<MongoUserDocument>("users");
  }

  async findById(id: string): Promise<UserReadModel | null> {
    const document = await this.collection.findOne({
      _id: id,
    });

    if (!document) {
      return null;
    }

    return this.toReadModel(document);
  }

  async findAll(): Promise<UserReadModel[]> {
    const documents = await this.collection
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return documents.map((document) => this.toReadModel(document));
  }

  private toReadModel(document: MongoUserDocument): UserReadModel {
    return {
      id: document.id,
      email: document.email,
      name: document.name,
      roles: document.roles,
      permissions: document.permissions,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      version: document.version,
    };
  }
}
