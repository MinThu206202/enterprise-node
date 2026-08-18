import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository.js";
import type { RoleResponseDto } from "../../dto/roles/RoleResponseDto.js";

export class GetAllRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.findAll();

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }
}
