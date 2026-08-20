import { IRolePermissionRepository } from "../../../domain/repositories/IRolePermissionRepository.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { AssignPermissionToRoleInput } from "../../dto/rolePermissions/AssignPermissionToRoleInput.js";

export class AssignPermissionToRoleUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async create(input: AssignPermissionToRoleInput): Promise<void> {
    const alreadyExists = await this.rolePermissionRepository.exists(
      input.roleId,
      input.permissionId,
    );

    if (alreadyExists) {
      throw new ConflictError("Permission is already assigned to this role.");
    }

    await this.rolePermissionRepository.assign(
      input.roleId,
      input.permissionId,
    );
  }
}
