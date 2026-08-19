import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createRoleSchema,
} from "../../../../src/application/validation/roles/createRoleSchema.js";
import { updateRoleSchema } from "../../../../src/application/validation/roles/updateRoleSchema.js";

import type { CreateRoleUseCase } from "../../../../src/application/use-cases/roles/CreateRoleUseCase.js";
import type { GetRoleUseCase } from "../../../../src/application/use-cases/roles/GetRoleUseCase.js";
import type { GetAllRolesUseCase } from "../../../../src/application/use-cases/roles/GetAllRolesUseCase.js";
import type { UpdateRoleUseCase } from "../../../../src/application/use-cases/roles/UpdateRoleUseCase.js";
import type { DeleteRoleUseCase } from "../../../../src/application/use-cases/roles/DeleteRoleUseCase.js";

import { ValidationError } from "../../../../src/shared/errors/ValidationError.js";

export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly getAllRolesUseCase: GetAllRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = createRoleSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const role = await this.createRoleUseCase.execute(result.data);

    return reply.status(201).send({
      data: role,
    });
  }

  async getById(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const role = await this.getRoleUseCase.execute(request.params.id);

    return reply.status(200).send({
      data: role,
    });
  }

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const roles = await this.getAllRolesUseCase.execute();

    return reply.status(200).send({
      data: roles,
    });
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

    const role = await this.updateRoleUseCase.execute(
      request.params.id,
      result.data,
    );

    return reply.status(200).send({
      data: role,
    });
  }

  async delete(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    await this.deleteRoleUseCase.execute(request.params.id);

    return reply.status(204).send();
  }
}
