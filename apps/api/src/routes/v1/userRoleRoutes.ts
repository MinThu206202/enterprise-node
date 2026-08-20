import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";

import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";

export async function userRoleRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_req, body, done) => {
      const str = typeof body === "string" ? body.trim() : "";
      if (str === "") {
        return done(null, {});
      }
      try {
        done(null, JSON.parse(str));
      } catch (err) {
        done(err as Error, undefined);
      }
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
      await container.assignRoleToUserUseCase.execute({
        userId: request.params.userId,
        roleId: request.params.roleId,
      });

      return reply.code(204).send();
    },
  );
}
