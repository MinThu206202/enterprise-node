import Fastify, { type FastifyInstance } from "fastify";

import { registerErrorHandler } from "./plugins/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  registerErrorHandler(app);

  app.get("/health", async () => {
    return {
      status: "ok",
      message: "API is running",
    };
  });

  app.register(authRoutes);

  return app;
}
