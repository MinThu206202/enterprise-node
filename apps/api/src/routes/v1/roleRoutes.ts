import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { RoleController } from "../../controllers/RoleController.js";
import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";

export async function roleRoutes(app: FastifyInstance): Promise<void> {
  const controller = new RoleController(
    container.commandBus,
    container.queryBus,
  );

  app.post(
    "/roles",
    {
      config: {
        resource: "roles",
        action: "create",
      },

      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
    },

    async (request, reply) => {
      return controller.create(request, reply);
    },
  );

  app.get(
    "/roles",
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
      return controller.getAll(request, reply);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/roles/:id",
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
      return controller.getById(request, reply);
    },
  );

  app.put<{ Params: { id: string } }>(
    "/roles/:id",
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
      return controller.update(request, reply);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/roles/:id",
    {
      config: {
        resource: "roles",
        action: "delete",
      },

      preHandler: [
        authenticate,
        permissionGuard(container.authorizationService),
      ],
    },

    async (request, reply) => {
      return controller.delete(request, reply);
    },
  );
}
