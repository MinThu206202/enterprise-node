import type { ICommandHandler } from "../../bus/ICommand.js";
import type { CreateRoleCommand } from "./CreateRoleCommand.js";

import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { RoleResponseDto } from "../../dto/roles/RoleResponseDto.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";

export class CreateRoleCommandHandler
  implements ICommandHandler<CreateRoleCommand, RoleResponseDto>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<RoleResponseDto> {
    const existingRole = await this.roleRepository.findByName(
      command.input.name,
    );

    if (existingRole) {
      throw new ConflictError("Role already exists");
    }

    const createdRole = await this.roleRepository.create(command.input);

    return {
      id: createdRole.id,
      name: createdRole.name,
      description: createdRole.description,
      createdAt: createdRole.createdAt,
      updatedAt: createdRole.updatedAt,
    };
  }
}
