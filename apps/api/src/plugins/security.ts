import fp from "fastify-plugin";
import helmet from "@fastify/helmet";

export const registerSecurity = fp(
  async (app) => {
    await app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },

      crossOriginEmbedderPolicy: false,

      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },
    });
  },
  {
    name: "security",
  },
);
