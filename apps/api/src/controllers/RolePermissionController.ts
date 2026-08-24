import type { FastifyReply, FastifyRequest } from "fastify";

import { AssignPermissionToRoleCommand } from "../../../../src/application/commands/rolePermissions/AssignPermissionToRoleCommand.js";
import { RemovePermissionFromRoleCommand } from "../../../../src/application/commands/rolePermissions/RemovePermissionFromRoleCommand.js";
import { GetRolePermissionsQuery } from "../../../../src/application/queries/rolePermissions/GetRolePermissionsQuery.js";
import type { CommandBus } from "../../../../src/application/bus/CommandBus.js";
import type { QueryBus } from "../../../../src/application/bus/QueryBus.js";
import { GetRoleQuery } from "../../../../src/application/queries/roles/GetRoleQuery.js";

export class RolePermissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async assign(
    request: FastifyRequest<{
      Params: {
        roleId: string;
        permissionId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.commandBus.execute(new AssignPermissionToRoleCommand({
      roleId: request.params.roleId,
      permissionId: request.params.permissionId,
    }));

    const [role, permissions] = await Promise.all([
      this.queryBus.execute(new GetRoleQuery(request.params.roleId)),
      this.queryBus.execute(new GetRolePermissionsQuery(request.params.roleId)),
    ]);

    reply.code(200).send({
      message: "Permission assigned to role successfully",
      role,
      permissions,
    });
  }

  async remove(
    request: FastifyRequest<{
      Params: {
        roleId: string;
        permissionId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.commandBus.execute(new RemovePermissionFromRoleCommand({
      roleId: request.params.roleId,
      permissionId: request.params.permissionId,
    }));

    const [role, permissions] = await Promise.all([
      this.queryBus.execute(new GetRoleQuery(request.params.roleId)),
      this.queryBus.execute(new GetRolePermissionsQuery(request.params.roleId)),
    ]);

    reply.code(200).send({
      message: "Permission removed from role successfully",
      role,
      permissions,
    });
  }

  async getPermissions(
    request: FastifyRequest<{
      Params: {
        roleId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const [role, permissions] = await Promise.all([
      this.queryBus.execute(new GetRoleQuery(request.params.roleId)),
      this.queryBus.execute(new GetRolePermissionsQuery(request.params.roleId)),
    ]);

    reply.code(200).send({ role, permissions });
  }
}
