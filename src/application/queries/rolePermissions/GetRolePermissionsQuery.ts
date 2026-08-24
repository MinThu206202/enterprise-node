import type { IQuery } from "../../bus/IQuery.js";
import type { RolePermissionResponseDto } from "../../dto/rolePermissions/RolePermissionResponseDto.js";

export class GetRolePermissionsQuery implements IQuery {
  static readonly QUERY_TYPE = "getRolePermissions.query";

  readonly queryType = GetRolePermissionsQuery.QUERY_TYPE;

  declare readonly __result?: RolePermissionResponseDto[];

  constructor(
    public readonly roleId: string
  ) {}
}
