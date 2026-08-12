import Fastify, { type FastifyInstance } from "fastify";

import { registerErrorHandler } from "./plugins/errorHandler.js";
import { requestMetaPlugin } from "./plugins/requestMeta.js";
import { responseMetaPlugin } from "./plugins/responseMeta.js";

import { userRoutes } from "./routes/v1/userRoutes.js";
import { authRoutes } from "./routes/v1/authRoutes.js";
import { API_VERSION } from "../../../src/shared/http/ApiVersion.js";


export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  // Error handling
  registerErrorHandler(app);

  // Request metadata
  app.register(requestMetaPlugin);

  // Response metadata
  app.register(responseMetaPlugin);

  app.get("/health", async () => {
    return {
      status: "ok",
      message: "API is running",
    };
  });

  app.register(userRoutes, { prefix: `/${API_VERSION}` });
  app.register(authRoutes, { prefix: `/${API_VERSION}` });


  return app;
}
