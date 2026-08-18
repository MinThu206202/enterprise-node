import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { RoleController } from "../../controllers/RoleController.js";

export async function roleRoutes(app: FastifyInstance): Promise<void> {
  const controller = new RoleController(
    container.createRoleUseCase,
    container.getRoleUseCase,
    container.getAllRolesUseCase,
    container.updateRoleUseCase,
    container.deleteRoleUseCase,
  );

  app.post("/roles", async (request, reply) => {
    return controller.create(request, reply);
  });

  app.get("/roles", async (request, reply) => {
    return controller.getAll(request, reply);
  });

  app.get<{ Params: { id: string } }>("/roles/:id", async (request, reply) => {
    return controller.getById(request, reply);
  });

  app.put<{ Params: { id: string } }>(
    "/roles/:id",
    async (request, reply) => {
      return controller.update(request, reply);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/roles/:id",
    async (request, reply) => {
      return controller.delete(request, reply);
    },
  );
}
