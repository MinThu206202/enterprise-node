import Fastify, { type FastifyInstance } from "fastify";

import { registerErrorHandler } from "./plugins/errorHandler.js";
import { requestMetaPlugin } from "./plugins/requestMeta.js";
import { responseMetaPlugin } from "./plugins/responseMeta.js";
import { registerRateLimit } from "./plugins/rateLimit.js";
import { registerSecurity } from "./plugins/security.js";
import { registerCors } from "./plugins/cors.js";

import { userRoutes } from "./routes/v1/userRoutes.js";
import { authRoutes } from "./routes/v1/authRoutes.js";
import { meRoutes } from "./routes/v1/meRoutes.js";
import { roleRoutes } from "./routes/v1/roleRoutes.js";
import { rolePermissionRoutes } from "./routes/v1/rolePermissionRoutes.js";

import { API_VERSION } from "../../../src/shared/http/ApiVersion.js";
import { registerRedis } from "./plugins/redis.js";
import { registerSwagger, swaggerCsp } from "./plugins/swagger.js";
import { userRoleRoutes } from "./routes/v1/userRoleRoutes.js";
import { permissionRoutes } from "./routes/v1/permissionRoutes.js";

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  registerErrorHandler(app);

  // Must register before Helmet so this onSend runs after Helmet and can
  // relax CSP only for Swagger UI (CDN + inline scripts).
  app.addHook("onSend", async (request, reply, payload) => {
    if (request.url.startsWith("/swagger")) {
      reply.header("Content-Security-Policy", swaggerCsp);
    }
    return payload;
  });

  // Swagger docs at /swagger
  app.register(registerSwagger);

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

  //redis connection
  app.register(registerRedis);

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

  app.register(meRoutes, {
    prefix: `/${API_VERSION}`,
  });

  app.register(roleRoutes, {
    prefix: `/${API_VERSION}`,
  });

  app.register(rolePermissionRoutes, {
    prefix: `/${API_VERSION}`,
  });

  app.register(userRoleRoutes, {
    prefix: `/${API_VERSION}`,
  });

  app.register(permissionRoutes, {
    prefix: `/${API_VERSION}`,
  });

  return app;
}
