import type { AuthorizationContext } from "../../application/context/AuthorizationContext.js";
import type { IAuthorizationCache } from "../../application/services/authorization/IAuthorizationCache.js";
import { redisClient } from "./redisClient.js";

const AUTHORIZATION_CACHE_PREFIX = "authorization:user:";
const AUTHORIZATION_CACHE_TTL_SECONDS = 300; // 5 minutes

export class RedisAuthorizationCache implements IAuthorizationCache {
  private getKey(userId: string): string {
    return `${AUTHORIZATION_CACHE_PREFIX}${userId}`;
  }

  async get(userId: string): Promise<AuthorizationContext | null> {
    const key = this.getKey(userId);

    const cached = await redisClient.get(key);

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as AuthorizationContext;
  }

  async set(
    userId: string,
    authorization: AuthorizationContext,
  ): Promise<void> {
    const key = this.getKey(userId);

    await redisClient.set(key, JSON.stringify(authorization), {
      EX: AUTHORIZATION_CACHE_TTL_SECONDS,
    });
  }

  async invalidate(userId: string): Promise<void> {
    const key = this.getKey(userId);

    await redisClient.del(key);
  }
}
