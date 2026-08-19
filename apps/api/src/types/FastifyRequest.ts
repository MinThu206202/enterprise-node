import "fastify";
import { AuthorizationContext } from "../../../../src/application/context/AuthorizationContext.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
    authorization : AuthorizationContext;
    startTime: number;
  }
}
