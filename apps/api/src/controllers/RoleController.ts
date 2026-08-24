import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createRoleSchema,
} from "../../../../src/application/validation/roles/createRoleSchema.js";
import { updateRoleSchema } from "../../../../src/application/validation/roles/updateRoleSchema.js";

import type { CommandBus } from "../../../../src/application/bus/CommandBus.js";
import type { QueryBus } from "../../../../src/application/bus/QueryBus.js";
import { CreateRoleCommand } from "../../../../src/application/commands/roles/CreateRoleCommand.js";
import { UpdateRoleCommand } from "../../../../src/application/commands/roles/UpdateRoleCommand.js";
import { DeleteRoleCommand } from "../../../../src/application/commands/roles/DeleteRoleCommand.js";
import { GetRoleQuery } from "../../../../src/application/queries/roles/GetRoleQuery.js";
import { GetAllRolesQuery } from "../../../../src/application/queries/roles/GetAllRolesQuery.js";

import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";

export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = createRoleSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const role = await this.commandBus.execute(
      new CreateRoleCommand(result.data),
    );

    return reply.status(201).send(role);
  }

  async getById(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const role = await this.queryBus.execute(
      new GetRoleQuery(request.params.id),
    );

    return reply.status(200).send(role);
  }

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const roles = await this.queryBus.execute(new GetAllRolesQuery());

    return reply.status(200).send(roles);
  }

  async update(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const result = updateRoleSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const role = await this.commandBus.execute(
      new UpdateRoleCommand(request.params.id, result.data),
    );

    return reply.status(200).send(role);
  }

  async delete(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    await this.commandBus.execute(new DeleteRoleCommand(request.params.id));

    return reply.status(200).send({ message: "Role deleted successfully" });
  }
}
