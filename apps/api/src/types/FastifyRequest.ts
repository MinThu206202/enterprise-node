import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;

    startTime: number;

    authorization?: {
      roles: string[];
      permissions: string[];
    };
  }

  interface FastifyContextConfig {
    resource?: string;
  }
}
