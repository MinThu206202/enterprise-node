import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../services/authorization/IAuthorizationCache.js";

export class DeleteRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. Check whether role exists
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new Error("Role not found");
    }

    // 2. Soft delete role
    await this.roleRepository.softDelete(id);

    // 3. Cached authorization data of users holding this role is now stale
    await this.invalidateAffectedUsers(id);
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds =
      await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(
      userIds.map((id) => this.authorizationCache.invalidate(id)),
    );
  }
}
