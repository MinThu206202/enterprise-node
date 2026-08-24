import fp from "fastify-plugin";
import cors from "@fastify/cors";

import { env } from "../../../../src/infrastructure/config/env.js";

export const registerCors = fp(
  async (app) => {
    await app.register(cors, {
      origin: env.CORS_ORIGINS,

      credentials: true,

      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

      allowedHeaders: ["Content-Type", "Authorization"],

      exposedHeaders: ["X-Request-Id"],

      maxAge: 86400,
    });
  },
  {
    name: "cors",
  },
);
