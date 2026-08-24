import type { IQuery } from "../../../bus/IQuery.js";
import type { UserResponseDto } from "../dto/UserResponseDto.js";

export class GetCurrentUserQuery implements IQuery {
  static readonly QUERY_TYPE = "getCurrentUser.query";

  readonly queryType = GetCurrentUserQuery.QUERY_TYPE;

  declare readonly __result?: UserResponseDto;

  constructor(
    public readonly userId: string
  ) {}
}
