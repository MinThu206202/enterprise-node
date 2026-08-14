import type { FastifyInstance } from "fastify";

import { createApiMeta } from "../../../../src/shared/http/ApiResponseBuilder.js";

export async function responseMetaPlugin(app: FastifyInstance): Promise<void> {
  app.addHook("onSend", async (request, reply, payload) => {
    // Keep OpenAPI/Swagger payloads untouched.
    if (request.url.startsWith("/swagger")) {
      return payload;
    }

    // Only process successful HTTP responses.
    if (reply.statusCode < 200 || reply.statusCode >= 300) {
      return payload;
    }

    const contentType = reply.getHeader("content-type");

    if (
      typeof contentType !== "string" ||
      !contentType.includes("application/json")
    ) {
      return payload;
    }

    if (typeof payload !== "string") {
      return payload;
    }

    try {
      const parsed = JSON.parse(payload);

      // Prevent double wrapping.
      if (
        parsed &&
        typeof parsed === "object" &&
        "data" in parsed &&
        "meta" in parsed
      ) {
        return payload;
      }

      const response = {
        data: parsed,

        meta: createApiMeta({
          requestId: request.id,
          startTime: request.startTime,
          status: "SUCCESS",
        }),
      };

      return JSON.stringify(response);
    } catch {
      return payload;
    }
  });
}
