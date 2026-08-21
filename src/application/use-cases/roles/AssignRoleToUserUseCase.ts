import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import type { IAuthorizationCache } from "../../services/authorization/IAuthorizationCache.js";

import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class AssignRoleToUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly authorizationCache: IAuthorizationCache,
  ) {}

  async execute(userId: string, roleId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    const alreadyAssigned = await this.userRoleRepository.exists(
      userId,
      roleId,
    );

    if (alreadyAssigned) {
      throw new ConflictError("Role is already assigned to this user.");
    }

    await this.userRoleRepository.assign(userId, roleId);

    // Authorization data is now stale.
    await this.authorizationCache.invalidate(userId);
  }
}
