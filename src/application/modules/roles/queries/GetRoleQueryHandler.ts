import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetRoleQuery } from "./GetRoleQuery.js";

import type { IRoleRepository } from "../../../../domain/repositories/IRoleRepository.js";
import type { RoleResponseDto } from "../dto/RoleResponseDto.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";

export class GetRoleQueryHandler
  implements IQueryHandler<GetRoleQuery, RoleResponseDto>
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(query: GetRoleQuery): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(query.id);

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
