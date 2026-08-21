import { IRolePermissionRepository } from "../../../domain/repositories/IRolePermissionRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../services/authorization/IAuthorizationCache.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { AssignPermissionToRoleInput } from "../../dto/rolePermissions/AssignPermissionToRoleInput.js";

export class AssignPermissionToRoleUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
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

    await this.invalidateAffectedUsers(input.roleId);
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds = await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(userIds.map((id) => this.authorizationCache.invalidate(id)));
  }
}
