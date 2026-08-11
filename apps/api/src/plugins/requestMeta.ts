import type { FastifyInstance } from "fastify";

export async function requestMetaPlugin(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (request) => {
    request.startTime = performance.now();
  });
}
