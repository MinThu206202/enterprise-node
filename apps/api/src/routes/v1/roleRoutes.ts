import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { RoleController } from "../../controllers/RoleController.js";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";

export async function roleRoutes(app: FastifyInstance): Promise<void> {
  const controller = new RoleController(
    container.createRoleUseCase,
    container.getRoleUseCase,
    container.getAllRolesUseCase,
    container.updateRoleUseCase,
    container.deleteRoleUseCase,
  );

  app.post(
    "/roles",
    {
      preHandler: [
        authenticate,
        authorize(container.authorizationService, {
          permissions: ["roles:create"],
        }),
      ],
    },
    async (request, reply) => {
      return controller.create(request, reply);
    },
  );

  app.get(
    "/roles",
    {
      preHandler: [
        authenticate,
        authorize(container.authorizationService, {
          permissions: ["roles:read"],
        }),
      ],
    },
    async (request, reply) => {
      return controller.getAll(request, reply);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/roles/:id",
    {
      preHandler: [
        authenticate,
        authorize(container.authorizationService, {
          permissions: ["roles:read"],
        }),
      ],
    },
    async (request, reply) => {
      return controller.getById(request, reply);
    },
  );

  app.put<{ Params: { id: string } }>(
    "/roles/:id",
    {
      preHandler: [
        authenticate,
        authorize(container.authorizationService, {
          permissions: ["roles:update"],
        }),
      ],
    },
    async (request, reply) => {
      return controller.update(request, reply);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/roles/:id",
    {
      preHandler: [
        authenticate,
        authorize(container.authorizationService, {
          permissions: ["roles:delete"],
        }),
      ],
    },
    async (request, reply) => {
      return controller.delete(request, reply);
    },
  );
}
