import type { IPermissionReader } from "../../../../domain/repositories/IPermissionReader.js";
import type { RolePermissionResponseDto } from "../dto/RolePermissionResponseDto.js";
import type { IQueryHandler } from "../../../bus/IQuery.js";
import type { GetAllPermissionsQuery } from "./GetAllPermissionsQuery.js";

export class GetAllPermissionsQueryHandler implements IQueryHandler<GetAllPermissionsQuery, RolePermissionResponseDto[]> {
  constructor(
    private readonly permissionReader: IPermissionReader,
  ) {}

  async execute(_query: GetAllPermissionsQuery): Promise<RolePermissionResponseDto[]> {
    const permissions = await this.permissionReader.findAll();

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }));
  }
}
