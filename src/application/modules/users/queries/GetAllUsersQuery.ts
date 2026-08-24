import type { IQuery } from "../../../bus/IQuery.js";
import type { UserResponseDto } from "../dto/UserResponseDto.js";

export class GetAllUsersQuery implements IQuery {
  static readonly QUERY_TYPE = "getAllUsers.query";

  readonly queryType = GetAllUsersQuery.QUERY_TYPE;

  declare readonly __result?: UserResponseDto[];

}
