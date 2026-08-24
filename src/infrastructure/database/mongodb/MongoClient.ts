import { Db, MongoClient as NativeMongoClient } from "mongodb";

export class MongoClient {
  private readonly client: NativeMongoClient;
  private db: Db | null = null;

  constructor(
    url: string,
    private readonly databaseName: string,
  ) {
    this.client = new NativeMongoClient(url);
  }

  async connect(): Promise<Db> {
    await this.client.connect();

    this.db = this.client.db(this.databaseName);

    return this.db;
  }

  get database(): Db {
    if (!this.db) {
      throw new Error("MongoDB is not connected");
    }

    return this.db;
  }

  async ping(): Promise<void> {
    await this.database.command({
      ping: 1,
    });
  }

  async close(): Promise<void> {
    await this.client.close();

    this.db = null;
  }
}
