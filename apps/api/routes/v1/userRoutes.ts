import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { UserController } from "../../controllers/UserController.js";
import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";
import type { CreateUserInput } from "../../../../src/application/modules/users/dto/CreateUserInput.js";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const controller = new UserController(
    container.commandBus,
    container.queryBus,
  );

  app.post<{ Body: CreateUserInput }>(
    "/users",
    {
      config: {
        resource: "users",
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
    "/users",
    {
      config: {
        resource: "users",
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
    "/users/:id",
    {
      config: {
        resource: "users",
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
}
