import type { IQuery } from "../../bus/IQuery.js";
import type { UserRolesResponseDto } from "../../dto/userRoles/UserRolesResponseDto.js";

export class GetUserRolesQuery implements IQuery {
  static readonly QUERY_TYPE = "getUserRoles.query";

  readonly queryType = GetUserRolesQuery.QUERY_TYPE;

  declare readonly __result?: UserRolesResponseDto[];

  constructor(
    public readonly userId: string
  ) {}
}
