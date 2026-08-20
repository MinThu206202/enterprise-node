import type { IRolePermissionRepository } from "../../../domain/repositories/IRolePermissionRepository.js";
import type { AssignPermissionToRoleInput } from "../../dto/rolePermissions/AssignPermissionToRoleInput.js";

export class RemovePermissionFromRoleUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(input: AssignPermissionToRoleInput): Promise<void> {
    const exists = await this.rolePermissionRepository.exists(
      input.roleId,
      input.permissionId,
    );

    if (!exists) {
      return;
    }

    await this.rolePermissionRepository.remove(
      input.roleId,
      input.permissionId,
    );
  }
}
