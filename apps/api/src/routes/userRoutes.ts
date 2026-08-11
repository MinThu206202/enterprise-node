import type { FastifyInstance } from "fastify";

import { container } from "../container.js";
import { UserController } from "../controllers/UserController.js";
import type { CreateUserInput } from "../../../../src/application/dto/users/CreateUserInput.js";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const controller = new UserController(container.registerUserUseCase);

  app.post<{ Body: CreateUserInput }>("/users", async (request, reply) => {
    return controller.create(request, reply);
  });
}
