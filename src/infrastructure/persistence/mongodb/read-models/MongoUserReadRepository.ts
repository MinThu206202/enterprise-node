import type { Collection } from "mongodb";

import type { UserReadModel } from "../../../../application/read-models/users/UserReadModel.js";
import type { IUserReader } from "../../../../domain/repositories/IUserReader.js";
import { connectMongo } from "../MongoConnection.js";

interface UserReadDocument {
  _id: string;
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoUserReadRepository implements IUserReader {
  private collection: Collection<UserReadDocument> | null = null;

  private async getCollection(): Promise<Collection<UserReadDocument>> {
    if (this.collection) {
      return this.collection;
    }

    const database = await connectMongo();

    this.collection = database.collection<UserReadDocument>("users");

    return this.collection;
  }

  async findById(id: string): Promise<UserReadModel | null> {
    const collection = await this.getCollection();

    const document = await collection.findOne({
      _id: id,
    });

    if (!document) {
      return null;
    }

    return this.toReadModel(document);
  }

  async findAll(): Promise<UserReadModel[]> {
    const collection = await this.getCollection();

    const documents = await collection
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return documents.map((document) => this.toReadModel(document));
  }

  private toReadModel(document: UserReadDocument): UserReadModel {
    return {
      id: document.id,
      email: document.email,
      name: document.name,
      roles: document.roles,
      permissions: document.permissions,
      version: document.version,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
