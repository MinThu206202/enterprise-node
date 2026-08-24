import { MongoClient } from "./MongoClient.js";
import { MongoDatabase } from "./MongoDatabase.js";
import { env } from "../../config/env.js";

const client = new MongoClient(
  env.MONGODB_URL,
  env.MONGODB_DB,
);

let database: MongoDatabase | null = null;

export function getMongoClient(): MongoClient {
  return client;
}

export async function connectMongo(): Promise<MongoDatabase> {
  if (database) {
    return database;
  }

  await client.connect();

  database = new MongoDatabase(client);

  return database;
}

export async function closeMongo(): Promise<void> {
  await client.close();

  database = null;
}