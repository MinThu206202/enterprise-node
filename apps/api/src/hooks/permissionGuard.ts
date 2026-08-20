import type { FastifyReply, FastifyRequest } from "fastify";

import type { IAuthorizationService } from "../../../../src/application/services/authorization/IAuthorizationService.js";

import { PermissionResolver } from "../../../../src/application/services/authorization/PermissionResolver.js";

import { AppError } from "../../../../src/shared/errors/AppError.js";
import { ForbiddenError } from "../../../../src/shared/errors/ForbiddenError.js";


const permissionResolver = new PermissionResolver();


export function permissionGuard(
  authorizationService: IAuthorizationService,
) {

  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {

    const resource = request.routeOptions.config?.resource;

    if (!resource) {
      return;
    }

    const permission =
      permissionResolver.resolveFromRequest(
        resource,
        request,
      );

    if (!permission) {
      throw new ForbiddenError(
        "Unable to resolve permission.",
      );
    }

    let authorization;

    try {
      authorization =
        await authorizationService.getUserAuthorization(
          request.userId,
        );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new ForbiddenError(
        "Unable to verify permissions.",
      );
    }

    request.authorization = authorization;

    const hasPermission =
      authorization.permissions.includes(permission);

    if (!hasPermission) {
      throw new ForbiddenError(
        `Missing permission: ${permission}`,
      );
    }

  };

}