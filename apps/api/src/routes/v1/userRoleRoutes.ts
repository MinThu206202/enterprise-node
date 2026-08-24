import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { UserRoleController } from "../../controllers/UserRoleController.js";

import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";

export async function userRoleRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new UserRoleController(
    container.commandBus,
    container.queryBus,);

  fastify.get<{ Params: { userId: string } }>(
    "/users/:userId/roles",
    {
      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
      config: {
        resource: "user-roles",
        action: "read",
      },
    },
    async (request, reply) => {
      return controller.getByUser(request, reply);
    },
  );

  fastify.post<{
    Params: {
      userId: string;
      roleId: string;
    };
  }>(
    "/users/:userId/roles/:roleId",
    {
      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
      config: {
        resource: "user-roles",
        action: "assign",
      },
    },
    async (request, reply) => {
      return controller.assign(request, reply);
    },
  );

  fastify.delete<{
    Params: {
      userId: string;
      roleId: string;
    };
  }>(
    "/users/:userId/roles/:roleId",
    {
      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
      config: {
        resource: "user-roles",
        action: "delete",
      },
    },
    async (request, reply) => {
      return controller.remove(request, reply);
    },
  );
}
