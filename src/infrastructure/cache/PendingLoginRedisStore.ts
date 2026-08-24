import type { RedisClientType } from "redis";
import type { IPendingLoginStore, PendingLogin } from "../../domain/repositories/IPendingLoginStore.js";

export class PendingLoginRedisStore implements IPendingLoginStore {
  constructor(private readonly redis: RedisClientType) {}

  private getKey(verificationId: string): string {
    return `login:verification:${verificationId}`;
  }

  async create(
    verificationId: string,
    data: PendingLogin,
    ttlSeconds: number,
  ): Promise<void> {
    const key = this.getKey(verificationId);

    await this.redis.set(key, JSON.stringify(data), { EX: ttlSeconds });
  }

  async get(verificationId: string): Promise<PendingLogin | null> {
    const key = this.getKey(verificationId);

    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as PendingLogin;
  }

  async incrementAttempts(verificationId: string): Promise<number> {
    const key = this.getKey(verificationId);

    const value = await this.redis.get(key);

    if (!value) {
      return 0;
    }

    const data = JSON.parse(value) as PendingLogin;

    data.attempts += 1;

    const ttl = await this.redis.ttl(key);

    if (ttl > 0) {
      await this.redis.set(key, JSON.stringify(data), { EX: ttl });
    }

    return data.attempts;
  }

  async delete(verificationId: string): Promise<void> {
    await this.redis.del(this.getKey(verificationId));
  }
}
