import type { IRolePermissionRepository } from "../../../domain/repositories/IRolePermissionRepository.js";
import type { RolePermissionResponseDto } from "../../dto/rolePermissions/RolePermissionResponseDto.js";

export class GetRolePermissionsUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(roleId: string): Promise<RolePermissionResponseDto[]> {
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
}
