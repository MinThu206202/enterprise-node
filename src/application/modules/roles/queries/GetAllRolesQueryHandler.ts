import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetAllRolesQuery } from "./GetAllRolesQuery.js";

import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { RoleResponseDto } from "../dto/RoleResponseDto.js";

export class GetAllRolesQueryHandler
  implements IQueryHandler<GetAllRolesQuery, RoleResponseDto[]>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(_query: GetAllRolesQuery): Promise<RoleResponseDto[]> {
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
