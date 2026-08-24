import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { UpdateRoleCommand } from "./UpdateRoleCommand.js";

import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../../ports/authorization/IAuthorizationCache.js";
import type { RoleResponseDto } from "../dto/RoleResponseDto.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { ConflictError } from "../../../../shared/errors/ConflictError.js";

export class UpdateRoleCommandHandler
  implements ICommandHandler<UpdateRoleCommand, RoleResponseDto>
{
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(command.id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    if (command.input.name && command.input.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(
        command.input.name,
      );

      if (existingRole && existingRole.id !== command.id) {
        throw new ConflictError("Role name already exists");
      }
    }

    const updatedRole = await this.roleRepository.update(
      command.id,
      command.input,
    );

    // Cached authorization data (roles list) of users holding this role is now stale
    await this.invalidateAffectedUsers(command.id);

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      createdAt: updatedRole.createdAt,
      updatedAt: updatedRole.updatedAt,
    };
  }

  private async invalidateAffectedUsers(roleId: string): Promise<void> {
    const userIds =
      await this.userRoleRepository.findUserIdsByRoleId(roleId);

    await Promise.all(
      userIds.map((userId) => this.authorizationCache.invalidate(userId)),
    );
  }
}
