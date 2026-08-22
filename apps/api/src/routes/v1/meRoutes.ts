import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { UserController } from "../../controllers/UserController.js";

import { authenticate } from "../../hooks/authenticate.js";

export async function meRoutes(app: FastifyInstance): Promise<void> {
  const controller = new UserController(
    container.registerUserUseCase,
    container.getCurrentUserUseCase,
    container.getAllUsersUseCase,
    container.getUserByIdUseCase,
  );

  app.get(
    "/users/me",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      return controller.getMe(request, reply);
    },
  );
}
