import type { IQuery } from "../../bus/IQuery.js";
import type { RolePermissionResponseDto } from "../../dto/rolePermissions/RolePermissionResponseDto.js";

export class GetAllPermissionsQuery implements IQuery {
  static readonly QUERY_TYPE = "getAllPermissions.query";

  readonly queryType = GetAllPermissionsQuery.QUERY_TYPE;

  declare readonly __result?: RolePermissionResponseDto[];

}
