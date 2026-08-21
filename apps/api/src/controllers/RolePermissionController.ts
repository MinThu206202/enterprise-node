import type { FastifyReply, FastifyRequest } from "fastify";

import { AssignPermissionToRoleUseCase } from "../../../../src/application/use-cases/rolePermissions/AssignPermissionToRoleUseCase.js";
import { RemovePermissionFromRoleUseCase } from "../../../../src/application/use-cases/rolePermissions/RemovePermissionFromRoleUseCase.js";
import { GetRolePermissionsUseCase } from "../../../../src/application/use-cases/rolePermissions/GetRolePermissionsUseCase.js";
import { GetRoleUseCase } from "../../../../src/application/use-cases/roles/GetRoleUseCase.js";

export class RolePermissionController {
  constructor(
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionFromRoleUseCase: RemovePermissionFromRoleUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
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

    const [role, permissions] = await Promise.all([
      this.getRoleUseCase.execute(request.params.roleId),
      this.getRolePermissionsUseCase.execute(request.params.roleId),
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
    await this.removePermissionFromRoleUseCase.execute({
      roleId: request.params.roleId,
      permissionId: request.params.permissionId,
    });

    const [role, permissions] = await Promise.all([
      this.getRoleUseCase.execute(request.params.roleId),
      this.getRolePermissionsUseCase.execute(request.params.roleId),
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
      this.getRoleUseCase.execute(request.params.roleId),
      this.getRolePermissionsUseCase.execute(request.params.roleId),
    ]);

    reply.code(200).send({ role, permissions });
  }
}
