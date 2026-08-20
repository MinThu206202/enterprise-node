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
    permission?: {
      resource: string;
      action: string;
    };
  }
}