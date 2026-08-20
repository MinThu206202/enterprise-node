import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { IUserRoleRepository } from "../../../domain/repositories/IUserRoleRepository.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";

export interface AssignRoleToUserInput {
  userId: string;
  roleId: string;
}

export class AssignRoleToUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(input: AssignRoleToUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const role = await this.roleRepository.findById(input.roleId);

    if (!role) {
      throw new NotFoundError("Role not found.");
    }

    const alreadyAssigned = await this.userRoleRepository.exists(
      input.userId,
      input.roleId,
    );

    if (alreadyAssigned) {
      throw new ConflictError("Role is already assigned to this user.");
    }

    await this.userRoleRepository.assign(input.userId, input.roleId);
  }
}
