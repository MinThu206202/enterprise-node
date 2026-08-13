import type { FastifyInstance } from "fastify";

import { redisClient } from "../../../../src/infrastructure/redis/redisClient.js";

export async function registerRedis(app: FastifyInstance): Promise<void> {
  await redisClient.connect();

  app.addHook("onClose", async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });
}
