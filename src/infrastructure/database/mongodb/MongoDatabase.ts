import type { Collection, Db } from "mongodb";

import type { MongoClient } from "./MongoClient.js";

export class MongoDatabase {
  constructor(private readonly client: MongoClient) {}

  get db(): Db {
    return this.client.database;
  }

  collection<TSchema extends object>(name: string): Collection<TSchema> {
    return this.client.database.collection<TSchema>(name);
  }
}
