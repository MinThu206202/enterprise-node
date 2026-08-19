import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { UserController } from "../../controllers/UserController.js";
import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";
import type { CreateUserInput } from "../../../../../src/application/dto/users/CreateUserInput.js";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const controller = new UserController(container.registerUserUseCase, container.getCurrentUserUseCase);

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
}
