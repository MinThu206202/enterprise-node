import type { FastifyReply, FastifyRequest } from "fastify";

import { AssignRoleToUserCommand } from "../../../../src/application/commands/userRoles/AssignRoleToUserCommand.js";
import { RemoveRoleFromUserCommand } from "../../../../src/application/commands/userRoles/RemoveRoleFromUserCommand.js";
import { GetUserRolesQuery } from "../../../../src/application/queries/userRoles/GetUserRolesQuery.js";
import type { CommandBus } from "../../../../src/application/bus/CommandBus.js";
import type { QueryBus } from "../../../../src/application/bus/QueryBus.js";

export class UserRoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async assign(
    request: FastifyRequest<{
      Params: {
        userId: string;
        roleId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.commandBus.execute(new AssignRoleToUserCommand({
      userId: request.params.userId,
      roleId: request.params.roleId,
    }));

    const roles = await this.getUserRoles(request.params.userId);

    reply.code(200).send({
      message: "Role assigned to user successfully",
      userId: request.params.userId,
      roles,
    });
  }

  async remove(
    request: FastifyRequest<{
      Params: {
        userId: string;
        roleId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveRoleFromUserCommand({
      userId: request.params.userId,
      roleId: request.params.roleId,
    }));

    const roles = await this.getUserRoles(request.params.userId);

    reply.code(200).send({
      message: "Role removed from user successfully",
      userId: request.params.userId,
      roles,
    });
  }

  async getByUser(
    request: FastifyRequest<{
      Params: {
        userId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const roles = await this.queryBus.execute(new GetUserRolesQuery(
      request.params.userId,
    ));

    return reply.status(200).send(roles);
  }

  private async getUserRoles(userId: string) {
    return this.queryBus.execute(new GetUserRolesQuery(userId));
  }
}
