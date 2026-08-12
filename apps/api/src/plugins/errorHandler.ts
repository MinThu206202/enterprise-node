import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../../../../src/shared/errors/AppError.js";

import { createApiMeta } from "../../../../src/shared/http/ApiResponseBuilder.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      const appError = error instanceof AppError ? error : null;

      const statusCode = appError?.statusCode ?? 500;

      const code = appError?.code ?? "INTERNAL_SERVER_ERROR";

      const message = appError?.message ?? "An unexpected error occurred";

      request.log.error(error);
      if ("statusCode" in error && error.statusCode === 429) {
        return reply.status(429).send({
          data: null,

          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests",
          },

          meta: createApiMeta({
            requestId: request.id,
            startTime: request.startTime,
            status: "ERROR",
          }),
        });
      }

      return reply.status(statusCode).send({
        data: null,

        error: {
          code,
          message,
        },

        meta: createApiMeta({
          requestId: request.id,
          startTime: request.startTime,
          status: "ERROR",
        }),
      });
    },
  );
}
