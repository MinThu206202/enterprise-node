import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../services/authorization/IAuthorizationCache.js";
import type { UpdateRoleInput } from "../../dto/roles/UpdateRoleInput.js";
import type { RoleResponseDto } from "../../dto/roles/RoleResponseDto.js";

export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async execute(id: string, input: UpdateRoleInput): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new Error("Role not found");
    }

    if (input.name && input.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(input.name);

      if (existingRole && existingRole.id !== id) {
        throw new Error("Role name already exists");
      }
    }

    const updatedRole = await this.roleRepository.update(id, input);

    // Cached authorization data (roles list) of users holding this role is now stale
    await this.invalidateAffectedUsers(id);

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
