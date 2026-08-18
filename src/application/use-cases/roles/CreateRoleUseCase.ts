import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { CreateRoleInput } from "../../dto/roles/CreateRoleInput.js";
import type { RoleResponseDto } from "../../dto/roles/RoleResponseDto.js";

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: CreateRoleInput): Promise<RoleResponseDto> {
    const existingRole = await this.roleRepository.findByName(input.name);

    if (existingRole) {
      throw new Error("Role already exists");
    }

    const createdRole = await this.roleRepository.create(input);

    return {
      id: createdRole.id,
      name: createdRole.name,
      description: createdRole.description,
      createdAt: createdRole.createdAt,
      updatedAt: createdRole.updatedAt,
    };
  }
}
