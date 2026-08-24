import type { ICommandHandler } from "../../bus/ICommand.js";
import type { DeleteRoleCommand } from "./DeleteRoleCommand.js";

import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../services/authorization/IAuthorizationCache.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class DeleteRoleCommandHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    // 1. Check whether role exists
    const role = await this.roleRepository.findById(command.id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // 2. Soft delete role
    await this.roleRepository.softDelete(command.id);

    // 3. Cached authorization data of users holding this role is now stale
    await this.invalidateAffectedUsers(command.id);
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds =
      await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(
      userIds.map((id) => this.authorizationCache.invalidate(id)),
    );
  }
}
