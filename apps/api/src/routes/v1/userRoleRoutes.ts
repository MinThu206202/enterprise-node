import type { FastifyInstance } from "fastify";

import { container } from "../../container.js";
import { UserRoleController } from "../../controllers/UserRoleController.js";

import { authenticate } from "../../hooks/authenticate.js";
import { permissionGuard } from "../../hooks/permissionGuard.js";

export async function userRoleRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new UserRoleController(
    container.assignRoleToUserUseCase,
    container.removeRoleFromUserUseCase,
  );

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
      const roleIds = await container.userRoleRepository.findRolesByUserId(
        request.params.userId,
      );

      const roles = await Promise.all(
        roleIds.map((id) => container.roleRepository.findById(id)),
      );

      return reply.status(200).send({
        data: roles.filter(Boolean).map((role) => ({
          id: role!.id,
          name: role!.name,
          description: role!.description,
        })),
      });
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
