import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const requestMetaPlugin = fp(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request) => {
    request.startTime = performance.now();
  });
});
