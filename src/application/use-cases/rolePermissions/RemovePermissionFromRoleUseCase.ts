import type { IRolePermissionRepository } from "../../../domain/repositories/IRolePermissionRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../services/authorization/IAuthorizationCache.js";
import type { AssignPermissionToRoleInput } from "../../dto/rolePermissions/AssignPermissionToRoleInput.js";

export class RemovePermissionFromRoleUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
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

    await this.invalidateAffectedUsers(input.roleId);
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds = await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(userIds.map((id) => this.authorizationCache.invalidate(id)));
  }
}
