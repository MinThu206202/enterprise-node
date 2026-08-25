import type { IRoleReader } from "../../../../domain/repositories/IRoleReader.js";
import type { IPermissionReader } from "../../../../domain/repositories/IPermissionReader.js";
import type { RolePermissionResponseDto } from "../dto/RolePermissionResponseDto.js";
import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetRolePermissionsQuery } from "./GetRolePermissionsQuery.js";

export class GetRolePermissionsQueryHandler implements IQueryHandler<GetRolePermissionsQuery, RolePermissionResponseDto[]> {
  constructor(
    private readonly roleReader: IRoleReader,
    private readonly permissionReader: IPermissionReader,
  ) {}

  async execute(query: GetRolePermissionsQuery): Promise<RolePermissionResponseDto[]> {
    const role = await this.roleReader.findById(query.roleId);

    if (!role || role.permissions.length === 0) {
      return [];
    }

    const permissions =
      await this.permissionReader.findByNames(role.permissions);

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }));
  }
}
