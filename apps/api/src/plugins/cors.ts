import fp from "fastify-plugin";
import cors from "@fastify/cors";

export const registerCors = fp(
  async (app) => {
    await app.register(cors, {
      origin: ["http://localhost:3000", "http://localhost:5173"],

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
