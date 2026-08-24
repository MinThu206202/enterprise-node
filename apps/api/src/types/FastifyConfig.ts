
declare module "fastify" {
  interface FastifyContextConfig {
    resource?: string;
    action?: string;
  }
}
