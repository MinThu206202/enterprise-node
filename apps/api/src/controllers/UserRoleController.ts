import type { FastifyReply, FastifyRequest } from "fastify";
import { AssignRoleToUserUseCase } from "../../../../src/application/use-cases/userRoles/AssignRoleToUserUseCase.js";
import { RemoveRoleFromUserUseCase } from "../../../../src/application/use-cases/userRoles/RemoveRoleFromUserUseCase.js";

export class UserRoleController {
  constructor(
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
    private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
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
    await this.assignRoleToUserUseCase.execute({
      userId: request.params.userId,
      roleId: request.params.roleId,
    });

    reply.code(204).send();
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
    await this.removeRoleFromUserUseCase.execute({
      userId: request.params.userId,
      roleId: request.params.roleId,
    });

    reply.code(204).send();
  }
}
