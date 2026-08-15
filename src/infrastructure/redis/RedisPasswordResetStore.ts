import type {
    IPasswordResetStore,
    PasswordResetData,
} from "../../application/services/ password-reset/IPasswordResetStore.js";

import { redisClient } from "./redisClient.js";

const PASSWORD_RESET_PREFIX = "password-reset:";
const PASSWORD_RESET_TTL_SECONDS = 600;

export class RedisPasswordResetStore implements IPasswordResetStore {
    private buildKey(verificationId: string) {
        return `${PASSWORD_RESET_PREFIX}${verificationId}`;
    }

    async create(
        verificationId: string,
        data: PasswordResetData,
        ttlSeconds: number = PASSWORD_RESET_TTL_SECONDS,
    ): Promise<void> {
        const key = this.buildKey(verificationId);

        await redisClient.set(key, JSON.stringify(data), {
            EX: ttlSeconds,
        });
    }

    async get(verificationId: string): Promise<PasswordResetData | null> {
        const key = this.buildKey(verificationId);

        const value = await redisClient.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value) as PasswordResetData;
    }

    async update(
        verificationId: string,
        data: PasswordResetData,
        ttlSeconds: number = PASSWORD_RESET_TTL_SECONDS,
    ): Promise<void> {
        const key = this.buildKey(verificationId);

        await redisClient.set(key, JSON.stringify(data), {
            EX: ttlSeconds,
        });
    }

    async incrementAttempts(verificationId: string): Promise<number> {
        const key = this.buildKey(verificationId);

        const data = await this.get(verificationId);

        if (!data) {
            return 0;
        }

        data.attempts += 1;

        const ttl = await redisClient.ttl(key);

        await redisClient.set(key, JSON.stringify(data), {
            EX: ttl > 0 ? ttl : PASSWORD_RESET_TTL_SECONDS,
        });

        return data.attempts;
    }

    async delete(verificationId: string): Promise<void> {
        const key = this.buildKey(verificationId);

        await redisClient.del(key);
    }

    async exists(verificationId: string): Promise<boolean> {
        const key = this.buildKey(verificationId);

        const result = await redisClient.exists(key);

        return result === 1;
    }

    async acquireVerificationLock(
        verificationId: string,
        lockId: string,
        ttlSeconds: number,
    ): Promise<boolean> {
        const result = await redisClient.set(
            `password-reset-lock:${verificationId}`,
            lockId,
            {
                NX: true,
                EX: ttlSeconds,
            },
        );

        return result === "OK";
    }

    async releaseVerificationLock(
        verificationId: string,
        lockId: string,
    ): Promise<void> {
        const key = `password-reset-lock:${verificationId}`;

        await redisClient.eval(
            `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      end
      return 0
    `,
            {
                keys: [key],
                arguments: [lockId],
            },
        );
    }
}
