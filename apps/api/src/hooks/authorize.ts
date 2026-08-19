import type { FastifyReply, FastifyRequest } from "fastify";

import { ForbiddenError } from "../../../../src/shared/errors/ForbiddenError.js";

import type { IAuthorizationService } from "../../../../src/application/services/authorization/IAuthorizationService.js";

export interface AuthorizationOptions {
  roles?: string[];
  permissions?: string[];
}

export function authorize(
  authorizationService: IAuthorizationService,
  options: AuthorizationOptions,
) {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {
    const authorization = await authorizationService.getUserAuthorization(
      request.userId,
    );

    request.authorization = authorization;

    if (options.roles && options.roles.length > 0) {
      const hasRequiredRole = options.roles.some((role) =>
        authorization.roles.includes(role),
      );

      if (!hasRequiredRole) {
        throw new ForbiddenError("You do not have the required role.");
      }
    }

    if (options.permissions && options.permissions.length > 0) {
      const hasRequiredPermissions = options.permissions.every((permission) =>
        authorization.permissions.includes(permission),
      );

      if (!hasRequiredPermissions) {
        throw new ForbiddenError("You do not have the required permission.");
      }
    }
  };
}
