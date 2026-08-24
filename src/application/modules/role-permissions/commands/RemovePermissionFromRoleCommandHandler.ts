import type { IRolePermissionRepository } from "../../../../domain/repositories/IRolePermissionRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../../ports/authorization/IAuthorizationCache.js";
import type { AssignPermissionToRoleInput } from "../dto/AssignPermissionToRoleInput.js";
import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { RemovePermissionFromRoleCommand } from "./RemovePermissionFromRoleCommand.js";

export class RemovePermissionFromRoleCommandHandler implements ICommandHandler<RemovePermissionFromRoleCommand, void> {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  private async handle(input: AssignPermissionToRoleInput): Promise<void> {
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

  async execute(command: RemovePermissionFromRoleCommand): Promise<void> {
    return this.handle(command.input);
  }
}
