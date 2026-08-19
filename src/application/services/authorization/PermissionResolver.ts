import type { FastifyRequest } from "fastify";

import { PermissionAction } from "./PermissionAction.js";

export class PermissionResolver {
  /**
   * Convert HTTP method to default permission action
   *
   * POST   -> create
   * GET    -> read
   * PUT    -> update
   * PATCH  -> update
   * DELETE -> delete
   */
  resolveAction(method: string): string | null {
    switch (method.toUpperCase()) {
      case "POST":
        return PermissionAction.CREATE;

      case "GET":
        return PermissionAction.READ;

      case "PUT":
      case "PATCH":
        return PermissionAction.UPDATE;

      case "DELETE":
        return PermissionAction.DELETE;

      default:
        return null;
    }
  }

  /**
   * Create permission string
   *
   * Example: "roles" + "create" -> "roles:create"
   */
  resolve(resource: string, action: string): string {
    return `${resource}:${action}`;
  }

  /**
   * Resolve permission from route config
   *
   * If config.action is set, use it directly (for custom actions like "transfer").
   * Otherwise fall back to HTTP method mapping.
   */
  resolveFromRequest(resource: string, request: FastifyRequest): string | null {
    const configAction = request.routeOptions.config?.action as string | undefined;

    if (configAction) {
      return this.resolve(resource, configAction);
    }

    const action = this.resolveAction(request.method);

    if (!action) {
      return null;
    }

    return this.resolve(resource, action);
  }
}
