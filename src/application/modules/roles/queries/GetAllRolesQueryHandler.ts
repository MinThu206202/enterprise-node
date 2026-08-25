import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetAllRolesQuery } from "./GetAllRolesQuery.js";

import type { IRoleReader } from "../../../../domain/repositories/IRoleReader.js";
import type { RoleResponseDto } from "../dto/RoleResponseDto.js";

export class GetAllRolesQueryHandler
  implements IQueryHandler<GetAllRolesQuery, RoleResponseDto[]>
{
  constructor(private readonly roleReader: IRoleReader) {}

  async execute(_query: GetAllRolesQuery): Promise<RoleResponseDto[]> {
    const roles = await this.roleReader.findAll();

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }
}
