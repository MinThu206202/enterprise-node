import type { Collection } from "mongodb";

import type { MongoUserDocument } from "./MongoUserDocument.js";

export class MongoUserReadModelInitializer {
  constructor(private readonly collection: Collection<MongoUserDocument>) {}

  async initialize(): Promise<void> {
    await this.collection.createIndex(
      {
        email: 1,
      },
      {
        unique: true,
      },
    );

    await this.collection.createIndex({
      createdAt: -1,
    });
  }
}
