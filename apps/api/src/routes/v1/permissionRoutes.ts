import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { PermissionController } from "../../controllers/PermissionController.js";
import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";

export async function permissionRoutes(app: FastifyInstance): Promise<void> {
  const controller = new PermissionController(
    container.queryBus,);

  app.get(
    "/permissions",
    {
      config: {
        resource: "permissions",
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
}
