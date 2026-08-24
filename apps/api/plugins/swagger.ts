import type { FastifyInstance } from "fastify";

import { openApiDocument } from "../docs/openapi.js";

export const swaggerCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' https: data:",
  "img-src 'self' data: https:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  "connect-src 'self'",
].join("; ");

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/swagger/openapi.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
      });
    </script>
  </body>
</html>`;

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  app.get("/swagger/openapi.json", async (_request, reply) => {
    return reply.type("application/json").send(openApiDocument);
  });

  app.get("/swagger", async (_request, reply) => {
    return reply.type("text/html").send(swaggerHtml);
  });
}
