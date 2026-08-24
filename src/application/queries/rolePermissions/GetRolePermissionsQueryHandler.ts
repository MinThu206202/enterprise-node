import type { IRolePermissionRepository } from "../../../domain/repositories/IRolePermissionRepository.js";
import type { RolePermissionResponseDto } from "../../dto/rolePermissions/RolePermissionResponseDto.js";
import type { IQueryHandler } from "../../bus/IQuery.js";
import type { GetRolePermissionsQuery } from "./GetRolePermissionsQuery.js";

export class GetRolePermissionsQueryHandler implements IQueryHandler<GetRolePermissionsQuery, RolePermissionResponseDto[]> {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  private async handle(roleId: string): Promise<RolePermissionResponseDto[]> {
    const permissions =
      await this.rolePermissionRepository.findPermissionsByRoleId(roleId);

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }));
  }

  async execute(command: GetRolePermissionsQuery): Promise<RolePermissionResponseDto[]> {
    return this.handle(command.roleId);
  }
}
