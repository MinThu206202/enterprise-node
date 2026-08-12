import Fastify, { type FastifyInstance } from "fastify";

import { registerErrorHandler } from "./plugins/errorHandler.js";
import { requestMetaPlugin } from "./plugins/requestMeta.js";
import { responseMetaPlugin } from "./plugins/responseMeta.js";
import { registerRateLimit } from "./plugins/rateLimit.js";
import { registerSecurity } from "./plugins/security.js";
import { registerCors } from "./plugins/cors.js";

import { userRoutes } from "./routes/v1/userRoutes.js";
import { authRoutes } from "./routes/v1/authRoutes.js";

import { API_VERSION } from "../../../src/shared/http/ApiVersion.js";

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  registerErrorHandler(app);

  // Request metadata
  app.register(requestMetaPlugin);

  // Response metadata
  app.register(responseMetaPlugin);

  // Security headers
  app.register(registerSecurity);

  // CORS
  app.register(registerCors);

  // Rate limiting
  app.register(registerRateLimit);

  app.get("/health", async () => {
    return {
      status: "ok",
      message: "API is running",
    };
  });

  app.register(userRoutes, {
    prefix: `/${API_VERSION}`,
  });

  app.register(authRoutes, {
    prefix: `/${API_VERSION}`,
  });

  return app;
}
