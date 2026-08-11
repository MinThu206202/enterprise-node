import type { FastifyReply, FastifyRequest } from "fastify";

import { container } from "../container.js";

import { UnauthorizedError } from "../../../../src/shared/errors/UnauthorizedError.js";

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authorization = request.headers.authorization;

  if (!authorization) {
    throw new UnauthorizedError("Authentication required");
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization header");
  }

  try {
    const payload = await container.tokenService.verifyAccessToken(token);

    request.userId = payload.userId;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
