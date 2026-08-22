import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { RoleResponseDto } from "../../dto/roles/RoleResponseDto.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
