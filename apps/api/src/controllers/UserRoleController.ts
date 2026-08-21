import type { FastifyReply, FastifyRequest } from "fastify";
import { AssignRoleToUserUseCase } from "../../../../src/application/use-cases/userRoles/AssignRoleToUserUseCase.js";
import { RemoveRoleFromUserUseCase } from "../../../../src/application/use-cases/userRoles/RemoveRoleFromUserUseCase.js";
import type { IUserRoleRepository } from "../../../../src/domain/repositories/IUserRoleRepository.js";
import type { IRoleRepository } from "../../../../src/domain/repositories/IRoleRepository.js";

export class UserRoleController {
  constructor(
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
    private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly roleRepository: IRoleRepository,
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
    await this.removeRoleFromUserUseCase.execute({
      userId: request.params.userId,
      roleId: request.params.roleId,
    });

    const roles = await this.getUserRoles(request.params.userId);

    reply.code(200).send({
      message: "Role removed from user successfully",
      userId: request.params.userId,
      roles,
    });
  }

  private async getUserRoles(userId: string) {
    const roleIds = await this.userRoleRepository.findRolesByUserId(userId);
    const roles = await Promise.all(
      roleIds.map((id) => this.roleRepository.findById(id)),
    );

    return roles
      .filter(Boolean)
      .map((role) => ({
        id: role!.id,
        name: role!.name,
        description: role!.description,
      }));
  }
}
