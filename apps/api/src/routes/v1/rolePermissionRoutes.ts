import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { RolePermissionController } from "../../controllers/RolePermissionController.js";
import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";

export async function rolePermissionRoutes(
  app: FastifyInstance,
): Promise<void> {
  const controller = new RolePermissionController(
    container.assignPermissionToRoleUseCase,
    container.removePermissionFromRoleUseCase,
    container.getRolePermissionsUseCase,
  );

  app.post<{
    Params: {
      roleId: string;
      permissionId: string;
    };
  }>(
    "/roles/:roleId/permissions/:permissionId",
    {
      config: {
        resource: "roles",
        action: "update",
      },

      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
    },
    async (request, reply) => {
      return controller.assign(
        {
          ...request,
          body: {
            roleId: request.params.roleId,
            permissionId: request.params.permissionId,
          },
        } as typeof request,
        reply,
      );
    },
  );

  app.delete<{
    Params: {
      roleId: string;
      permissionId: string;
    };
  }>(
    "/roles/:roleId/permissions/:permissionId",
    {
      config: {
        resource: "roles",
        action: "update",
      },

      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
    },
    async (request, reply) => {
      return controller.remove(
        {
          ...request,
          body: {
            roleId: request.params.roleId,
            permissionId: request.params.permissionId,
          },
        } as typeof request,
        reply,
      );
    },
  );

  app.get<{ Params: { roleId: string } }>(
    "/roles/:roleId/permissions",
    {
      config: {
        resource: "roles",
        action: "read",
      },

      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
    },

    async (request, reply) => {
      return controller.getPermissions(request, reply);
    },
  );
}
