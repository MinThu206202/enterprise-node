import type { IQuery } from "../../bus/IQuery.js";
import type { UserResponseDto } from "../../dto/users/UserResponseDto.js";

export class GetUserByIdQuery implements IQuery {
  static readonly QUERY_TYPE = "getUserById.query";

  readonly queryType = GetUserByIdQuery.QUERY_TYPE;

  declare readonly __result?: UserResponseDto;

  constructor(
    public readonly userId: string
  ) {}
}
