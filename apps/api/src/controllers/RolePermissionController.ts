import type { FastifyReply, FastifyRequest } from "fastify";

import { AssignPermissionToRoleUseCase } from "../../../../src/application/use-cases/rolePermissions/AssignPermissionToRoleUseCase.js";
import { RemovePermissionFromRoleUseCase } from "../../../../src/application/use-cases/rolePermissions/RemovePermissionFromRoleUseCase.js";
import { GetRolePermissionsUseCase } from "../../../../src/application/use-cases/rolePermissions/GetRolePermissionsUseCase.js";

export class RolePermissionController {
  constructor(
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionFromRoleUseCase: RemovePermissionFromRoleUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
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
    await this.assignPermissionToRoleUseCase.create({
      roleId: request.params.roleId,
      permissionId: request.params.permissionId,
    });

    reply.code(204).send();
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
    await this.removePermissionFromRoleUseCase.execute({
      roleId: request.params.roleId,
      permissionId: request.params.permissionId,
    });

    reply.code(204).send();
  }

  async getPermissions(
    request: FastifyRequest<{
      Params: {
        roleId: string;
      };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const permissions = await this.getRolePermissionsUseCase.execute(
      request.params.roleId,
    );

    reply.code(200).send(permissions);
  }
}
