import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import type { RemoveRoleFromUserInput } from "../../dto/userRoles/RemoveRoleFromUserInput.js";

export class RemoveRoleFromUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(input: RemoveRoleFromUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const role = await this.roleRepository.findById(input.roleId);

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    const assigned = await this.userRoleRepository.exists(
      input.userId,
      input.roleId,
    );

    if (!assigned) {
      throw new NotFoundError("Role is not assigned to this user.");
    }

    await this.userRoleRepository.remove(
      input.userId,
      input.roleId,
    );
  }
}

